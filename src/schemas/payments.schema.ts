import { ReconciliationStatus, SettlementStatus } from "@prisma/client";
import { z } from "zod";

/** Pagination metadata attached to list responses. */
export const paginationMetaSchema = z.object({
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  hasMore: z.boolean(),
});

export type PaginationMetaView = z.infer<typeof paginationMetaSchema>;

/** A gateway transaction as returned by the payments API. */
export const transactionViewSchema = z.object({
  id: z.string(),
  easebuzzTxnId: z.string(),
  easebuzzPaymentId: z.string().nullable(),
  amountPaise: z.number().int(),
  feesPaise: z.number().int(),
  netAmountPaise: z.number().int(),
  currency: z.string(),
  status: z.string(),
  mode: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  txnid: z.string().nullable(),
  matchedOrderId: z.string().nullable(),
  settlementStatus: z.nativeEnum(SettlementStatus),
  occurredAt: z.string(),
});

export type TransactionView = z.infer<typeof transactionViewSchema>;

/** A gateway settlement (payout) as returned by the settlements API. */
export const settlementViewSchema = z.object({
  id: z.string(),
  payoutId: z.string(),
  payoutDate: z.string(),
  totalAmountPaise: z.number().int(),
  transactionCount: z.number().int(),
  status: z.string(),
  utrNumber: z.string().nullable(),
  bankAccountLast4: z.string().nullable(),
});

export type SettlementView = z.infer<typeof settlementViewSchema>;

/** A gateway refund as returned by the refunds API. */
export const refundViewSchema = z.object({
  id: z.string(),
  refundId: z.string(),
  transactionId: z.string(),
  amountPaise: z.number().int(),
  status: z.string(),
  shopifyRefundId: z.string().nullable(),
  processedAt: z.string().nullable(),
});

export type RefundView = z.infer<typeof refundViewSchema>;

/** A reconciliation record as returned by the reconciliation API. */
export const reconciliationViewSchema = z.object({
  id: z.string(),
  shopifyOrderId: z.string().nullable(),
  transactionId: z.string().nullable(),
  status: z.nativeEnum(ReconciliationStatus),
  expectedAmountPaise: z.number().int().nullable(),
  actualAmountPaise: z.number().int().nullable(),
  deltaPaise: z.number().int().nullable(),
  reason: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  resolvedByUserId: z.string().nullable(),
  createdAt: z.string(),
});

export type ReconciliationView = z.infer<typeof reconciliationViewSchema>;

/** A shop summary as returned by the shops list API. */
export const shopViewSchema = z.object({
  id: z.string(),
  shopDomain: z.string(),
  shopName: z.string(),
  currency: z.string(),
  isActive: z.boolean(),
  onboardingStep: z.string(),
});

export type ShopView = z.infer<typeof shopViewSchema>;

/** Response payload for a manual reconcile trigger. */
export const reconcileTriggerSchema = z.object({ queued: z.boolean() });

export type ReconcileTrigger = z.infer<typeof reconcileTriggerSchema>;
