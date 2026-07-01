import {
  MatchingStrategy,
  ReconciliationStatus,
  type ReconciliationRecord,
} from "@prisma/client";

import { NotFoundError } from "@/lib/api/errors";
import { buildOrderBy, type ListQuery } from "@/lib/api/query";
import { prisma } from "@/lib/db";
import {
  reconcile,
  type EngineConfig,
  type ReconciliationResult,
} from "@/lib/reconciliation/engine";
import type { ReconciliationView } from "@/schemas/payments.schema";

const SORT_FIELDS = ["createdAt", "status", "deltaPaise"] as const;

const DEFAULT_CONFIG: EngineConfig = {
  strategy: MatchingStrategy.COMPOSITE,
  priority: [
    MatchingStrategy.UDF_ORDER_ID,
    MatchingStrategy.UDF_ORDER_NAME,
    MatchingStrategy.TXNID_ORDER_NAME,
    MatchingStrategy.SHOPIFY_PAYMENT_ID,
  ],
  fieldMapping: {},
  amountTolerancePaise: 0,
  includeGatewayFees: false,
};

/**
 * Loads a shop's matching config, falling back to a sensible default.
 * @param shopId - Target shop id
 * @returns Engine configuration
 */
async function loadConfig(shopId: string): Promise<EngineConfig> {
  const config = await prisma.matchingConfig.findUnique({ where: { shopId } });
  if (!config) {
    return DEFAULT_CONFIG;
  }
  return {
    strategy: config.strategy,
    priority: Array.isArray(config.priority)
      ? (config.priority as string[])
      : [],
    fieldMapping: (config.fieldMapping as Record<string, string>) ?? {},
    amountTolerancePaise: config.amountTolerancePaise,
    includeGatewayFees: config.includeGatewayFees,
  };
}

/**
 * Persists a single reconciliation result idempotently.
 *
 * Existing records for the same (order, transaction) pairing are updated unless
 * already RESOLVED; matched transactions also have `matchedOrderId` set.
 * @param shopId - Owning shop id
 * @param result - Engine result to persist
 */
async function persistResult(
  shopId: string,
  result: ReconciliationResult,
): Promise<void> {
  const existing = await prisma.reconciliationRecord.findFirst({
    where: {
      shopId,
      transactionId: result.transactionId,
      shopifyOrderId: result.shopifyOrderId,
    },
  });
  const data = {
    status: result.status,
    expectedAmountPaise: result.expectedAmountPaise,
    actualAmountPaise: result.actualAmountPaise,
    deltaPaise: result.deltaPaise,
    reason: result.reason,
  };

  if (existing) {
    if (existing.status !== ReconciliationStatus.RESOLVED) {
      await prisma.reconciliationRecord.update({ where: { id: existing.id }, data });
    }
  } else {
    await prisma.reconciliationRecord.create({ data: { shopId, ...result } });
  }

  if (result.transactionId && result.shopifyOrderId) {
    await prisma.gatewayTransaction.update({
      where: { id: result.transactionId },
      data: { matchedOrderId: result.shopifyOrderId },
    });
  }
}

/**
 * Runs reconciliation for a shop and persists the results.
 * @param shopId - Target shop id
 * @returns Number of reconciliation results processed
 */
export async function runReconciliation(
  shopId: string,
): Promise<{ processed: number }> {
  const [orders, transactions, refunds, config] = await Promise.all([
    prisma.shopifyOrder.findMany({
      where: { shopId },
      select: {
        id: true,
        shopifyOrderId: true,
        orderName: true,
        shopifyPaymentId: true,
        totalPricePaise: true,
        financialStatus: true,
      },
    }),
    prisma.gatewayTransaction.findMany({
      where: { shopId },
      select: {
        id: true,
        txnid: true,
        amountPaise: true,
        netAmountPaise: true,
        settlementStatus: true,
        udf1: true,
        udf2: true,
        udf3: true,
        udf4: true,
        udf5: true,
        udf6: true,
        udf7: true,
        udf8: true,
        udf9: true,
        udf10: true,
      },
    }),
    prisma.gatewayRefund.findMany({
      where: { shopId },
      select: { transactionId: true, amountPaise: true },
    }),
    loadConfig(shopId),
  ]);

  const results = reconcile({ orders, transactions, refunds, config });
  for (const result of results) {
    await persistResult(shopId, result);
  }
  return { processed: results.length };
}

/**
 * Maps a stored reconciliation record to its API view.
 * @param record - Reconciliation record
 * @returns Reconciliation view
 */
export function toReconciliationView(
  record: ReconciliationRecord,
): ReconciliationView {
  return {
    id: record.id,
    shopifyOrderId: record.shopifyOrderId,
    transactionId: record.transactionId,
    status: record.status,
    expectedAmountPaise: record.expectedAmountPaise,
    actualAmountPaise: record.actualAmountPaise,
    deltaPaise: record.deltaPaise,
    reason: record.reason,
    resolvedAt: record.resolvedAt?.toISOString() ?? null,
    resolvedByUserId: record.resolvedByUserId,
    createdAt: record.createdAt.toISOString(),
  };
}

/**
 * Lists reconciliation records for a shop with pagination and status filtering.
 * @param shopId - Target shop id
 * @param query - List query params
 * @returns Mapped records and total count
 */
export async function listReconciliation(
  shopId: string,
  query: ListQuery,
): Promise<{ items: ReconciliationView[]; total: number }> {
  const where = {
    shopId,
    ...(query.status
      ? { status: query.status as ReconciliationStatus }
      : {}),
  };
  const [records, total] = await Promise.all([
    prisma.reconciliationRecord.findMany({
      where,
      skip: query.skip,
      take: query.take,
      orderBy: buildOrderBy(query.sortBy, query.sortOrder, SORT_FIELDS, "createdAt"),
    }),
    prisma.reconciliationRecord.count({ where }),
  ]);
  return { items: records.map(toReconciliationView), total };
}

/**
 * Marks a reconciliation record as resolved by an admin user.
 * @param shopId - Owning shop id (scopes the update)
 * @param recordId - Reconciliation record id
 * @param userId - Resolving user id
 * @returns The updated reconciliation view
 * @throws {NotFoundError} When no matching record exists for the shop
 */
export async function resolveRecord(
  shopId: string,
  recordId: string,
  userId: string,
): Promise<ReconciliationView> {
  const updated = await prisma.reconciliationRecord.updateMany({
    where: { id: recordId, shopId },
    data: {
      status: ReconciliationStatus.RESOLVED,
      resolvedAt: new Date(),
      resolvedByUserId: userId,
    },
  });
  if (updated.count === 0) {
    throw new NotFoundError("Reconciliation record not found");
  }
  const record = await prisma.reconciliationRecord.findUnique({
    where: { id: recordId },
  });
  return toReconciliationView(record as ReconciliationRecord);
}
