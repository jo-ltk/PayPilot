import { Prisma, type GatewaySettlement } from "@prisma/client";

import { buildOrderBy, type ListQuery } from "@/lib/api/query";
import { prisma } from "@/lib/db";
import { toPaise } from "@/lib/money";
import { easebuzzPayoutWebhookSchema } from "@/schemas/easebuzz.schema";
import type { SettlementView } from "@/schemas/payments.schema";

const SORT_FIELDS = ["payoutDate", "totalAmountPaise", "status"] as const;

export type SettlementUpsertData = {
  payoutId: string;
  payoutDate: Date;
  totalAmountPaise: number;
  transactionCount: number;
  status: string;
  utrNumber: string | null;
  bankAccountLast4: string | null;
  rawPayload: Prisma.InputJsonValue;
};

/**
 * Maps an Easebuzz payout webhook payload to upsertable settlement data.
 * @param payload - Parsed webhook payload
 * @returns Normalized settlement data
 * @throws {z.ZodError} When required fields are missing
 */
export function mapSettlementPayload(payload: unknown): SettlementUpsertData {
  const parsed = easebuzzPayoutWebhookSchema.parse(payload);
  return {
    payoutId: parsed.payout_id,
    payoutDate: parsed.payout_date ? new Date(parsed.payout_date) : new Date(),
    totalAmountPaise: toPaise(parsed.payout_amount),
    transactionCount: parsed.transaction_count
      ? Number(parsed.transaction_count)
      : 0,
    status: parsed.status,
    utrNumber: parsed.utr ?? null,
    bankAccountLast4: parsed.account_number
      ? parsed.account_number.slice(-4)
      : null,
    rawPayload: payload as Prisma.InputJsonValue,
  };
}

/**
 * Upserts a gateway settlement (payout), keyed by `(shopId, payoutId)`.
 * @param shopId - Owning shop id
 * @param gatewayId - Owning gateway id
 * @param data - Normalized settlement data
 */
export async function upsertSettlement(
  shopId: string,
  gatewayId: string,
  data: SettlementUpsertData,
): Promise<void> {
  await prisma.gatewaySettlement.upsert({
    where: { shopId_payoutId: { shopId, payoutId: data.payoutId } },
    create: { shopId, gatewayId, ...data },
    update: data,
  });
}

/**
 * Maps a stored settlement to its API view (excludes the raw payload).
 * @param settlement - Gateway settlement record
 * @returns Settlement view
 */
export function toSettlementView(
  settlement: GatewaySettlement,
): SettlementView {
  return {
    id: settlement.id,
    payoutId: settlement.payoutId,
    payoutDate: settlement.payoutDate.toISOString(),
    totalAmountPaise: settlement.totalAmountPaise,
    transactionCount: settlement.transactionCount,
    status: settlement.status,
    utrNumber: settlement.utrNumber,
    bankAccountLast4: settlement.bankAccountLast4,
  };
}

/**
 * Lists a shop's settlements with pagination, filtering, and sorting.
 * @param shopId - Owning shop id
 * @param query - List query params
 * @returns Mapped settlements and total count
 */
export async function listSettlements(
  shopId: string,
  query: ListQuery,
): Promise<{ items: SettlementView[]; total: number }> {
  const payoutDate = {
    ...(query.from ? { gte: query.from } : {}),
    ...(query.to ? { lte: query.to } : {}),
  };
  const where: Prisma.GatewaySettlementWhereInput = {
    shopId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.from || query.to ? { payoutDate } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.gatewaySettlement.findMany({
      where,
      skip: query.skip,
      take: query.take,
      orderBy: buildOrderBy(query.sortBy, query.sortOrder, SORT_FIELDS, "payoutDate"),
    }),
    prisma.gatewaySettlement.count({ where }),
  ]);
  return { items: rows.map(toSettlementView), total };
}
