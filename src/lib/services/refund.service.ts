import { Prisma, type GatewayRefund } from "@prisma/client";

import { NotFoundError } from "@/lib/api/errors";
import { buildOrderBy, type ListQuery } from "@/lib/api/query";
import { prisma } from "@/lib/db";
import { toPaise } from "@/lib/money";
import { easebuzzRefundWebhookSchema } from "@/schemas/easebuzz.schema";
import type { RefundView } from "@/schemas/payments.schema";

const SORT_FIELDS = ["processedAt", "amountPaise", "status", "createdAt"] as const;

export type RefundUpsertData = {
  refundId: string;
  originalTxnId: string;
  amountPaise: number;
  status: string;
  processedAt: Date | null;
  rawPayload: Prisma.InputJsonValue;
};

/**
 * Maps an Easebuzz refund webhook payload to upsertable refund data.
 * @param payload - Parsed webhook payload
 * @returns Normalized refund data
 * @throws {z.ZodError} When required fields are missing
 */
export function mapRefundPayload(payload: unknown): RefundUpsertData {
  const parsed = easebuzzRefundWebhookSchema.parse(payload);
  return {
    refundId: parsed.refund_id,
    originalTxnId: parsed.txnid,
    amountPaise: toPaise(parsed.refund_amount),
    status: parsed.refund_status,
    processedAt: parsed.processed_on ? new Date(parsed.processed_on) : null,
    rawPayload: payload as Prisma.InputJsonValue,
  };
}

/**
 * Upserts a gateway refund, linking it to its parent transaction.
 *
 * The refund references its originating transaction by Easebuzz txn id; if that
 * transaction has not yet been persisted, the caller should retry (the refund
 * webhook may arrive before the transaction webhook).
 * @param shopId - Owning shop id
 * @param data - Normalized refund data
 * @throws {NotFoundError} When the parent transaction is not found
 */
export async function upsertRefund(
  shopId: string,
  data: RefundUpsertData,
): Promise<void> {
  const transaction = await prisma.gatewayTransaction.findUnique({
    where: {
      shopId_easebuzzTxnId: { shopId, easebuzzTxnId: data.originalTxnId },
    },
    select: { id: true },
  });
  if (!transaction) {
    throw new NotFoundError(
      `Transaction ${data.originalTxnId} not found for refund ${data.refundId}`,
    );
  }

  const record = {
    amountPaise: data.amountPaise,
    status: data.status,
    processedAt: data.processedAt,
    rawPayload: data.rawPayload,
  };
  await prisma.gatewayRefund.upsert({
    where: { shopId_refundId: { shopId, refundId: data.refundId } },
    create: {
      shopId,
      transactionId: transaction.id,
      refundId: data.refundId,
      shopifyRefundId: null,
      ...record,
    },
    update: record,
  });
}

/**
 * Maps a stored refund to its API view (excludes the raw payload).
 * @param refund - Gateway refund record
 * @returns Refund view
 */
export function toRefundView(refund: GatewayRefund): RefundView {
  return {
    id: refund.id,
    refundId: refund.refundId,
    transactionId: refund.transactionId,
    amountPaise: refund.amountPaise,
    status: refund.status,
    shopifyRefundId: refund.shopifyRefundId,
    processedAt: refund.processedAt?.toISOString() ?? null,
  };
}

/**
 * Lists a shop's refunds with pagination, filtering, and sorting.
 * @param shopId - Owning shop id
 * @param query - List query params
 * @returns Mapped refunds and total count
 */
export async function listRefunds(
  shopId: string,
  query: ListQuery,
): Promise<{ items: RefundView[]; total: number }> {
  const processedAt = {
    ...(query.from ? { gte: query.from } : {}),
    ...(query.to ? { lte: query.to } : {}),
  };
  const where: Prisma.GatewayRefundWhereInput = {
    shopId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.from || query.to ? { processedAt } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.gatewayRefund.findMany({
      where,
      skip: query.skip,
      take: query.take,
      orderBy: buildOrderBy(query.sortBy, query.sortOrder, SORT_FIELDS, "createdAt"),
    }),
    prisma.gatewayRefund.count({ where }),
  ]);
  return { items: rows.map(toRefundView), total };
}
