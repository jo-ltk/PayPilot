import { endOfDay, startOfDay, subDays } from "date-fns";

import type { AnalyticsSeriesPoint } from "@/schemas/analytics.schema";
import type { DateRange } from "@/types/common";

/** Default inclusive dashboard range: last 30 days. */
export function defaultDashboardRange(): DateRange {
  const to = endOfDay(new Date());
  const from = startOfDay(subDays(to, 29));
  return { from, to };
}

/**
 * Converts a UI date range to ISO strings for API query params.
 * @param range - Selected date range
 * @returns API-compatible from/to strings
 */
export function toApiDateRange(range: DateRange): {
  from?: string;
  to?: string;
} {
  return {
    from: range.from?.toISOString(),
    to: range.to?.toISOString(),
  };
}

/**
 * Builds a query string from optional API date params.
 * @param params - from/to ISO strings
 * @returns Query string including leading `?` when non-empty
 */
export function buildAnalyticsQuery(params: {
  from?: string;
  to?: string;
}): string {
  const search = new URLSearchParams();
  if (params.from) {
    search.set("from", params.from);
  }
  if (params.to) {
    search.set("to", params.to);
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

/** A single point in a settlement or refund trend chart. */
export type TrendPoint = {
  date: string;
  amountPaise: number;
  count: number;
};

/**
 * Aggregates dated amounts into a sorted daily trend series.
 * @param items - Rows with ISO date key and amount in paise
 * @returns Sorted trend points
 */
export function bucketByDate(
  items: { date: string; amountPaise: number }[],
): TrendPoint[] {
  const map = new Map<string, { amountPaise: number; count: number }>();

  for (const item of items) {
    const bucket = map.get(item.date) ?? { amountPaise: 0, count: 0 };
    bucket.amountPaise += item.amountPaise;
    bucket.count += 1;
    map.set(item.date, bucket);
  }

  return [...map.entries()]
    .map(([date, value]) => ({ date, ...value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Counts open reconciliation mismatches from status buckets.
 * @param reconciliation - Status → count map from analytics KPIs
 * @returns Total non-matched, unresolved records
 */
export function countSettlementMismatches(
  reconciliation: Record<string, number>,
): number {
  return Object.entries(reconciliation)
    .filter(([status]) => status !== "MATCHED" && status !== "RESOLVED")
    .reduce((sum, [, count]) => sum + count, 0);
}

/**
 * Computes a simple period-over-period trend from a daily series.
 * @param series - Daily gross volume points
 * @returns Trend direction and comparison label
 */
export function computeSeriesTrend(series: AnalyticsSeriesPoint[]): {
  direction: "up" | "down" | "neutral";
  value: string;
} {
  if (series.length < 2) {
    return { direction: "neutral", value: "No comparison data" };
  }

  const mid = Math.floor(series.length / 2);
  const firstHalf = series
    .slice(0, mid)
    .reduce((sum, point) => sum + point.grossPaise, 0);
  const secondHalf = series
    .slice(mid)
    .reduce((sum, point) => sum + point.grossPaise, 0);

  if (firstHalf === 0) {
    return secondHalf > 0
      ? { direction: "up", value: "New activity" }
      : { direction: "neutral", value: "No change" };
  }

  const pct = ((secondHalf - firstHalf) / firstHalf) * 100;
  const direction =
    pct > 0 ? "up" : pct < 0 ? "down" : "neutral";

  return {
    direction,
    value: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% vs prior period`,
  };
}
