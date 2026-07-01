import { differenceInDays, parseISO } from "date-fns";

import type { TrendPoint } from "@/lib/dashboard";
import type { AnalyticsKpis, AnalyticsSeriesPoint } from "@/schemas/analytics.schema";
import type {
  ReconciliationView,
  SettlementView,
  TransactionView,
} from "@/schemas/payments.schema";

/** A single day in a percentage trend chart. */
export type RateTrendPoint = {
  date: string;
  rate: number;
};

/** Gateway mode performance bucket. */
export type GatewayPerformance = {
  mode: string;
  count: number;
  volumePaise: number;
  successRate: number;
};

/** Derived insight metrics for the analytics page. */
export type AnalyticsInsights = {
  successRate: number;
  paymentHealthScore: number;
  refundPercentage: number;
  topPaymentDays: AnalyticsSeriesPoint[];
  largestSettlement: SettlementView | null;
  averageSettlementDays: number | null;
  gatewayPerformance: GatewayPerformance[];
  successRateTrend: RateTrendPoint[];
  matchRateTrend: RateTrendPoint[];
};

/**
 * Formats match rate whether stored as 0–1 or 0–100.
 * @param rate - Raw match rate from API
 * @returns Percentage on 0–100 scale
 */
export function normalizeMatchRate(rate: number): number {
  return rate > 1 ? rate : rate * 100;
}

/**
 * Computes a composite payment health score (0–100).
 * @param kpis - Analytics headline KPIs
 * @param successRate - Payment success rate (0–100)
 * @returns Health score
 */
export function computePaymentHealthScore(
  kpis: AnalyticsKpis,
  successRate: number,
): number {
  const matchPct = normalizeMatchRate(kpis.matchRate);
  const gross = Math.max(kpis.grossVolumePaise, 1);
  const pendingRatio = kpis.pendingSettlementPaise / gross;
  const refundRatio = kpis.refundTotalPaise / gross;
  const pendingScore = Math.max(0, 1 - pendingRatio) * 100;
  const refundScore = Math.max(0, 1 - refundRatio) * 100;

  const score =
    matchPct * 0.35 +
    successRate * 0.25 +
    pendingScore * 0.2 +
    refundScore * 0.2;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Computes payment success rate from transaction rows.
 * @param payments - Gateway transactions
 * @returns Success rate on 0–100 scale
 */
export function computeSuccessRate(payments: TransactionView[]): number {
  if (payments.length === 0) {
    return 0;
  }

  const successes = payments.filter(
    (payment) => payment.status.toLowerCase() === "success",
  ).length;

  return (successes / payments.length) * 100;
}

/**
 * Returns top payment days sorted by gross volume.
 * @param series - Daily revenue series
 * @param limit - Max rows
 * @returns Top days
 */
export function getTopPaymentDays(
  series: AnalyticsSeriesPoint[],
  limit = 3,
): AnalyticsSeriesPoint[] {
  return [...series]
    .sort((left, right) => right.grossPaise - left.grossPaise)
    .slice(0, limit);
}

/**
 * Finds the largest settlement in a list.
 * @param settlements - Settlement rows
 * @returns Largest settlement or null
 */
export function findLargestSettlement(
  settlements: SettlementView[],
): SettlementView | null {
  if (settlements.length === 0) {
    return null;
  }

  return settlements.reduce((largest, current) =>
    current.totalAmountPaise > largest.totalAmountPaise ? current : largest,
  );
}

/**
 * Estimates average settlement lag in days.
 * @param payments - Gateway transactions
 * @param settlements - Settlement payouts
 * @returns Average days or null when insufficient data
 */
export function computeAverageSettlementDays(
  payments: TransactionView[],
  settlements: SettlementView[],
): number | null {
  const settled = payments.filter(
    (payment) => payment.settlementStatus === "SETTLED",
  );

  if (settled.length === 0 || settlements.length === 0) {
    return null;
  }

  const avgPayout =
    settlements.reduce(
      (sum, settlement) => sum + parseISO(settlement.payoutDate).getTime(),
      0,
    ) / settlements.length;
  const avgOccurred =
    settled.reduce(
      (sum, payment) => sum + parseISO(payment.occurredAt).getTime(),
      0,
    ) / settled.length;

  return Math.max(
    0,
    Math.round(differenceInDays(new Date(avgPayout), new Date(avgOccurred))),
  );
}

/**
 * Groups payments by gateway mode with success rates.
 * @param payments - Gateway transactions
 * @returns Sorted gateway performance rows
 */
export function computeGatewayPerformance(
  payments: TransactionView[],
): GatewayPerformance[] {
  const buckets = new Map<string, { count: number; volumePaise: number; successes: number }>();

  for (const payment of payments) {
    const mode = payment.mode?.trim() || "Unknown";
    const bucket = buckets.get(mode) ?? {
      count: 0,
      volumePaise: 0,
      successes: 0,
    };
    bucket.count += 1;
    bucket.volumePaise += payment.amountPaise;
    if (payment.status.toLowerCase() === "success") {
      bucket.successes += 1;
    }
    buckets.set(mode, bucket);
  }

  return [...buckets.entries()]
    .map(([mode, value]) => ({
      mode,
      count: value.count,
      volumePaise: value.volumePaise,
      successRate: value.count === 0 ? 0 : (value.successes / value.count) * 100,
    }))
    .sort((left, right) => right.volumePaise - left.volumePaise);
}

/**
 * Builds a daily payment success rate series.
 * @param payments - Gateway transactions
 * @returns Sorted rate trend points
 */
export function buildSuccessRateTrend(
  payments: TransactionView[],
): RateTrendPoint[] {
  const byDay = new Map<string, { total: number; successes: number }>();

  for (const payment of payments) {
    const date = payment.occurredAt.slice(0, 10);
    const bucket = byDay.get(date) ?? { total: 0, successes: 0 };
    bucket.total += 1;
    if (payment.status.toLowerCase() === "success") {
      bucket.successes += 1;
    }
    byDay.set(date, bucket);
  }

  return [...byDay.entries()]
    .map(([date, value]) => ({
      date,
      rate: value.total === 0 ? 0 : (value.successes / value.total) * 100,
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

/**
 * Builds a daily reconciliation match rate series.
 * @param records - Reconciliation records
 * @returns Sorted rate trend points
 */
export function buildMatchRateTrend(
  records: ReconciliationView[],
): RateTrendPoint[] {
  const byDay = new Map<string, { total: number; matched: number }>();

  for (const record of records) {
    const date = record.createdAt.slice(0, 10);
    const bucket = byDay.get(date) ?? { total: 0, matched: 0 };
    bucket.total += 1;
    if (record.status === "MATCHED" || record.status === "RESOLVED") {
      bucket.matched += 1;
    }
    byDay.set(date, bucket);
  }

  return [...byDay.entries()]
    .map(([date, value]) => ({
      date,
      rate: value.total === 0 ? 0 : (value.matched / value.total) * 100,
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

/**
 * Computes refund volume as a percentage of gross revenue.
 * @param kpis - Analytics headline KPIs
 * @returns Refund percentage on 0–100 scale
 */
export function computeRefundPercentage(kpis: AnalyticsKpis): number {
  if (kpis.grossVolumePaise === 0) {
    return 0;
  }

  return (kpis.refundTotalPaise / kpis.grossVolumePaise) * 100;
}

/**
 * Converts trend points to CSV-friendly rows.
 * @param series - Amount trend series
 * @returns Plain row objects
 */
export function trendPointsToCsvRows(series: TrendPoint[]) {
  return series.map((point) => ({
    date: point.date,
    amountPaise: point.amountPaise,
    count: point.count,
  }));
}
