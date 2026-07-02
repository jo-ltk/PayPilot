import { ReconciliationStatus, SettlementStatus } from "@prisma/client";

import type { Rng } from "./seed-rng";
import {
  SEED_REFERENCE_DATE,
  type OrderRow,
  type ReconciliationRow,
  type RefundRow,
  type TransactionRow,
} from "./seed-types";

/**
 * Builds reconciliation records for orders and orphan transactions.
 * @param shopId - Demo shop id
 * @param userId - Demo owner user id
 * @param orders - Generated Shopify orders
 * @param transactions - Generated gateway transactions
 * @param refunds - Generated refunds
 * @param reconciliations - Output array to populate
 * @param rng - Seeded random generator
 */
export function buildReconciliations(
  shopId: string,
  userId: string,
  orders: OrderRow[],
  transactions: TransactionRow[],
  refunds: RefundRow[],
  reconciliations: ReconciliationRow[],
  rng: Rng,
): void {
  let reconIndex = 1;
  const txnsByOrder = new Map<string, TransactionRow[]>();
  for (const txn of transactions) {
    if (!txn.matchedOrderId) {
      continue;
    }
    const bucket = txnsByOrder.get(txn.matchedOrderId) ?? [];
    bucket.push(txn);
    txnsByOrder.set(txn.matchedOrderId, bucket);
  }
  const refundedTxnIds = new Set(refunds.map((r) => r.transactionId));

  for (const order of orders) {
    const matchedTxns = txnsByOrder.get(order.id) ?? [];
    if (matchedTxns.length > 0) {
      for (const txn of matchedTxns) {
        reconciliations.push(
          buildMatchedRecon(
            shopId,
            userId,
            order,
            txn,
            reconIndex,
            refunds,
            refundedTxnIds,
            rng,
          ),
        );
        reconIndex += 1;
      }
      continue;
    }
    reconciliations.push({
      id: `seed_recon_${reconIndex}`,
      shopId,
      shopifyOrderId: order.id,
      transactionId: null,
      status: ReconciliationStatus.MISSING_GATEWAY,
      expectedAmountPaise: order.totalPricePaise,
      actualAmountPaise: null,
      deltaPaise: null,
      reason: "Shopify order paid but no matching gateway transaction found",
      resolvedAt: null,
      resolvedByUserId: null,
      createdAt: order.processedAt ?? SEED_REFERENCE_DATE,
    });
    reconIndex += 1;
  }

  for (const txn of transactions.filter(
    (t) => !t.matchedOrderId && t.status === "success",
  )) {
    reconciliations.push({
      id: `seed_recon_${reconIndex}`,
      shopId,
      shopifyOrderId: null,
      transactionId: txn.id,
      status: ReconciliationStatus.MISSING_SHOPIFY,
      expectedAmountPaise: null,
      actualAmountPaise: txn.amountPaise,
      deltaPaise: null,
      reason: "Gateway payment captured without a matching Shopify order",
      resolvedAt: null,
      resolvedByUserId: null,
      createdAt: txn.occurredAt,
    });
    reconIndex += 1;
  }
}

function buildMatchedRecon(
  shopId: string,
  userId: string,
  order: OrderRow,
  txn: TransactionRow,
  reconIndex: number,
  refunds: RefundRow[],
  refundedTxnIds: Set<string>,
  rng: Rng,
): ReconciliationRow {
  const createdAt = txn.occurredAt;
  const refund = refunds.find((r) => r.transactionId === txn.id);

  if (txn.settlementStatus === SettlementStatus.PENDING) {
    return {
      id: `seed_recon_${reconIndex}`,
      shopId,
      shopifyOrderId: order.id,
      transactionId: txn.id,
      status: ReconciliationStatus.PENDING_SETTLEMENT,
      expectedAmountPaise: order.totalPricePaise,
      actualAmountPaise: txn.amountPaise,
      deltaPaise: 0,
      reason: "Payment matched; awaiting gateway settlement",
      resolvedAt: null,
      resolvedByUserId: null,
      createdAt,
    };
  }

  if (refund && refundedTxnIds.has(txn.id) && rng.bool(0.25)) {
    return {
      id: `seed_recon_${reconIndex}`,
      shopId,
      shopifyOrderId: order.id,
      transactionId: txn.id,
      status: ReconciliationStatus.REFUND_MISMATCH,
      expectedAmountPaise: order.totalPricePaise - refund.amountPaise,
      actualAmountPaise: txn.amountPaise - refund.amountPaise,
      deltaPaise: rng.int(-50000, 50000),
      reason: "Refund amount does not match Shopify refund record",
      resolvedAt: null,
      resolvedByUserId: null,
      createdAt,
    };
  }

  if (rng.bool(0.06)) {
    const delta = rng.int(-100000, 100000);
    const actual = order.totalPricePaise + delta;
    const isResolved = rng.bool(0.35);
    return {
      id: `seed_recon_${reconIndex}`,
      shopId,
      shopifyOrderId: order.id,
      transactionId: txn.id,
      status: isResolved
        ? ReconciliationStatus.RESOLVED
        : ReconciliationStatus.AMOUNT_MISMATCH,
      expectedAmountPaise: order.totalPricePaise,
      actualAmountPaise: actual,
      deltaPaise: delta,
      reason: isResolved
        ? "Amount mismatch resolved after manual review"
        : "Gateway amount differs from Shopify order total",
      resolvedAt: isResolved
        ? new Date(createdAt.getTime() + 86400000 * 3)
        : null,
      resolvedByUserId: isResolved ? userId : null,
      createdAt,
    };
  }

  return {
    id: `seed_recon_${reconIndex}`,
    shopId,
    shopifyOrderId: order.id,
    transactionId: txn.id,
    status: ReconciliationStatus.MATCHED,
    expectedAmountPaise: order.totalPricePaise,
    actualAmountPaise: txn.amountPaise,
    deltaPaise: order.totalPricePaise - txn.amountPaise,
    reason: "Matched on udf1 = shopifyOrderId",
    resolvedAt: null,
    resolvedByUserId: null,
    createdAt,
  };
}
