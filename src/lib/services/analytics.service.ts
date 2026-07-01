import { ReconciliationStatus, SettlementStatus } from "@prisma/client";

import { prisma } from "@/lib/db";
import type {
  AnalyticsKpis,
  AnalyticsResponse,
  AnalyticsSeriesPoint,
} from "@/schemas/analytics.schema";

/** Optional inclusive date range applied to analytics queries. */
export type AnalyticsRange = { from?: Date; to?: Date };

/**
 * Builds a Prisma date filter for a field, omitting absent bounds.
 * @param range - Optional from/to bounds
 * @returns Prisma date filter, or undefined when unbounded
 */
function dateFilter(range: AnalyticsRange) {
  if (!range.from && !range.to) {
    return undefined;
  }
  return {
    ...(range.from ? { gte: range.from } : {}),
    ...(range.to ? { lte: range.to } : {}),
  };
}

/**
 * Buckets transactions into a daily gross-volume time series (UTC days).
 * @param rows - Transactions with occurredAt and amount
 * @returns Sorted series points
 */
function computeSeries(
  rows: { occurredAt: Date; amountPaise: number }[],
): AnalyticsSeriesPoint[] {
  const byDay = new Map<string, { grossPaise: number; count: number }>();
  for (const row of rows) {
    const date = row.occurredAt.toISOString().slice(0, 10);
    const bucket = byDay.get(date) ?? { grossPaise: 0, count: 0 };
    bucket.grossPaise += row.amountPaise;
    bucket.count += 1;
    byDay.set(date, bucket);
  }
  return [...byDay.entries()]
    .map(([date, value]) => ({ date, ...value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Reduces reconciliation groupBy rows into a status → count record and rate.
 * @param rows - groupBy rows keyed by status
 * @returns Status counts and the matched rate
 */
function reconciliationStats(
  rows: { status: ReconciliationStatus; _count: { _all: number } }[],
): { counts: Record<string, number>; matchRate: number } {
  const counts: Record<string, number> = {};
  let total = 0;
  let matched = 0;
  for (const row of rows) {
    counts[row.status] = row._count._all;
    total += row._count._all;
    if (row.status === ReconciliationStatus.MATCHED) {
      matched = row._count._all;
    }
  }
  return { counts, matchRate: total === 0 ? 0 : matched / total };
}

/**
 * Aggregates the headline KPIs for a shop within an optional date range.
 * @param shopId - Target shop id
 * @param range - Optional date range applied to transactions
 * @returns Aggregated KPIs
 */
async function computeKpis(
  shopId: string,
  range: AnalyticsRange,
): Promise<AnalyticsKpis> {
  const occurredAt = dateFilter(range);
  const txnWhere = { shopId, ...(occurredAt ? { occurredAt } : {}) };

  const [txn, pending, refunds, settlements, recon] = await Promise.all([
    prisma.gatewayTransaction.aggregate({
      where: txnWhere,
      _count: { _all: true },
      _sum: { amountPaise: true, feesPaise: true, netAmountPaise: true },
    }),
    prisma.gatewayTransaction.aggregate({
      where: { ...txnWhere, settlementStatus: SettlementStatus.PENDING },
      _sum: { amountPaise: true },
    }),
    prisma.gatewayRefund.aggregate({
      where: { shopId },
      _count: { _all: true },
      _sum: { amountPaise: true },
    }),
    prisma.gatewaySettlement.aggregate({
      where: { shopId },
      _count: { _all: true },
      _sum: { totalAmountPaise: true },
    }),
    prisma.reconciliationRecord.groupBy({
      by: ["status"],
      where: { shopId },
      _count: { _all: true },
    }),
  ]);

  const { counts, matchRate } = reconciliationStats(recon);
  return {
    transactionCount: txn._count._all,
    grossVolumePaise: txn._sum.amountPaise ?? 0,
    feesPaise: txn._sum.feesPaise ?? 0,
    netVolumePaise: txn._sum.netAmountPaise ?? 0,
    refundCount: refunds._count._all,
    refundTotalPaise: refunds._sum.amountPaise ?? 0,
    settlementCount: settlements._count._all,
    settlementTotalPaise: settlements._sum.totalAmountPaise ?? 0,
    pendingSettlementPaise: pending._sum.amountPaise ?? 0,
    reconciliation: counts,
    matchRate,
  };
}

/**
 * Computes dashboard analytics (KPIs + daily volume series) for a shop.
 * @param shopId - Target shop id
 * @param range - Optional inclusive date range
 * @returns Analytics response payload
 */
export async function getAnalytics(
  shopId: string,
  range: AnalyticsRange,
): Promise<AnalyticsResponse> {
  const occurredAt = dateFilter(range);
  const [kpis, rows] = await Promise.all([
    computeKpis(shopId, range),
    prisma.gatewayTransaction.findMany({
      where: { shopId, ...(occurredAt ? { occurredAt } : {}) },
      select: { occurredAt: true, amountPaise: true },
    }),
  ]);

  return {
    from: range.from?.toISOString() ?? null,
    to: range.to?.toISOString() ?? null,
    kpis,
    series: computeSeries(rows),
  };
}
