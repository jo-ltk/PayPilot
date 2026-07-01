import { Prisma, type GatewayTransaction } from "@prisma/client";

import { buildOrderBy, type ListQuery } from "@/lib/api/query";
import { prisma } from "@/lib/db";
import { toPaise } from "@/lib/money";
import {
  easebuzzTransactionWebhookSchema,
  type EasebuzzTransactionWebhook,
} from "@/schemas/easebuzz.schema";
import type { TransactionView } from "@/schemas/payments.schema";

const SORT_FIELDS = ["occurredAt", "amountPaise", "status"] as const;

type UdfFields = {
  udf1: string | null;
  udf2: string | null;
  udf3: string | null;
  udf4: string | null;
  udf5: string | null;
  udf6: string | null;
  udf7: string | null;
  udf8: string | null;
  udf9: string | null;
  udf10: string | null;
};

export type TransactionUpsertData = UdfFields & {
  easebuzzTxnId: string;
  easebuzzPaymentId: string | null;
  amountPaise: number;
  feesPaise: number;
  netAmountPaise: number;
  currency: string;
  status: string;
  mode: string | null;
  email: string | null;
  phone: string | null;
  txnid: string;
  occurredAt: Date;
  rawPayload: Prisma.InputJsonValue;
};

/**
 * Extracts the ten Easebuzz UDF fields, normalising blanks to null.
 * @param parsed - Validated transaction payload
 * @returns UDF field map
 */
function mapUdfFields(parsed: EasebuzzTransactionWebhook): UdfFields {
  return {
    udf1: parsed.udf1 ?? null,
    udf2: parsed.udf2 ?? null,
    udf3: parsed.udf3 ?? null,
    udf4: parsed.udf4 ?? null,
    udf5: parsed.udf5 ?? null,
    udf6: parsed.udf6 ?? null,
    udf7: parsed.udf7 ?? null,
    udf8: parsed.udf8 ?? null,
    udf9: parsed.udf9 ?? null,
    udf10: parsed.udf10 ?? null,
  };
}

/**
 * Maps an Easebuzz transaction webhook payload to upsertable data.
 * @param payload - Parsed webhook payload
 * @returns Normalized transaction data
 * @throws {z.ZodError} When required fields are missing
 */
export function mapTransactionPayload(payload: unknown): TransactionUpsertData {
  const parsed = easebuzzTransactionWebhookSchema.parse(payload);
  const amountPaise = toPaise(parsed.amount);
  const feesPaise = parsed.easebuzz_charges ? toPaise(parsed.easebuzz_charges) : 0;
  return {
    easebuzzTxnId: parsed.txnid,
    easebuzzPaymentId: parsed.easepayid ?? null,
    amountPaise,
    feesPaise,
    netAmountPaise: amountPaise - feesPaise,
    currency: "INR",
    status: parsed.status,
    mode: parsed.mode ?? null,
    email: parsed.email ?? null,
    phone: parsed.phone ?? null,
    txnid: parsed.txnid,
    occurredAt: parsed.addedon ? new Date(parsed.addedon) : new Date(),
    rawPayload: payload as Prisma.InputJsonValue,
    ...mapUdfFields(parsed),
  };
}

/**
 * Upserts a gateway transaction, keyed by `(shopId, easebuzzTxnId)`.
 * @param shopId - Owning shop id
 * @param gatewayId - Owning gateway id
 * @param data - Normalized transaction data
 */
export async function upsertTransaction(
  shopId: string,
  gatewayId: string,
  data: TransactionUpsertData,
): Promise<void> {
  await prisma.gatewayTransaction.upsert({
    where: {
      shopId_easebuzzTxnId: { shopId, easebuzzTxnId: data.easebuzzTxnId },
    },
    create: { shopId, gatewayId, ...data },
    update: data,
  });
}

/**
 * Maps a stored transaction to its API view (excludes the raw payload).
 * @param txn - Gateway transaction record
 * @returns Transaction view
 */
export function toTransactionView(txn: GatewayTransaction): TransactionView {
  return {
    id: txn.id,
    easebuzzTxnId: txn.easebuzzTxnId,
    easebuzzPaymentId: txn.easebuzzPaymentId,
    amountPaise: txn.amountPaise,
    feesPaise: txn.feesPaise,
    netAmountPaise: txn.netAmountPaise,
    currency: txn.currency,
    status: txn.status,
    mode: txn.mode,
    email: txn.email,
    phone: txn.phone,
    txnid: txn.txnid,
    matchedOrderId: txn.matchedOrderId,
    settlementStatus: txn.settlementStatus,
    occurredAt: txn.occurredAt.toISOString(),
  };
}

/**
 * Builds the Prisma `where` filter for the payments list.
 * @param shopId - Owning shop id
 * @param query - List query params
 * @returns Prisma where clause
 */
function buildTransactionWhere(
  shopId: string,
  query: ListQuery,
): Prisma.GatewayTransactionWhereInput {
  const occurredAt = {
    ...(query.from ? { gte: query.from } : {}),
    ...(query.to ? { lte: query.to } : {}),
  };
  return {
    shopId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.from || query.to ? { occurredAt } : {}),
    ...(query.search
      ? {
          OR: [
            { easebuzzTxnId: { contains: query.search, mode: "insensitive" } },
            { txnid: { contains: query.search, mode: "insensitive" } },
            { email: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

/**
 * Lists a shop's transactions with pagination, filtering, and sorting.
 * @param shopId - Owning shop id
 * @param query - List query params
 * @returns Mapped transactions and total count
 */
export async function listTransactions(
  shopId: string,
  query: ListQuery,
): Promise<{ items: TransactionView[]; total: number }> {
  const where = buildTransactionWhere(shopId, query);
  const [rows, total] = await Promise.all([
    prisma.gatewayTransaction.findMany({
      where,
      skip: query.skip,
      take: query.take,
      orderBy: buildOrderBy(query.sortBy, query.sortOrder, SORT_FIELDS, "occurredAt"),
    }),
    prisma.gatewayTransaction.count({ where }),
  ]);
  return { items: rows.map(toTransactionView), total };
}
