"use client";

import { memo } from "react";

import { MetricCard } from "@/components/shared/metric-card";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import type { AnalyticsInsightsData } from "@/hooks/use-analytics-insights";

interface AnalyticsInsightsProps {
  insights?: AnalyticsInsightsData;
  isLoading: boolean;
}

/** Insight cards derived from analytics and list APIs. */
export const AnalyticsInsights = memo(function AnalyticsInsights({
  insights,
  isLoading,
}: AnalyticsInsightsProps) {
  if (isLoading || !insights) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`insight-skeleton-${index}`}
            className="h-24 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  const topDay = insights.topPaymentDays[0];
  const largest = insights.largestSettlement;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        label="Top payment day"
        value={
          topDay
            ? formatCurrency(topDay.grossPaise)
            : "—"
        }
        hint={topDay ? formatDate(topDay.date) : "No payment activity"}
      />
      <MetricCard
        label="Largest settlement"
        value={largest ? formatCurrency(largest.totalAmountPaise) : "—"}
        hint={largest ? formatDate(largest.payoutDate) : "No settlements yet"}
      />
      <MetricCard
        label="Refund percentage"
        value={formatPercent(insights.refundPercentage)}
        hint="Of gross revenue in period"
      />
      <MetricCard
        label="Average settlement time"
        value={
          insights.averageSettlementDays !== null
            ? `${insights.averageSettlementDays} days`
            : "—"
        }
        hint="Estimated payout lag"
      />
      <MetricCard
        label="Gateway performance"
        value={
          insights.gatewayPerformance[0]
            ? `${insights.gatewayPerformance[0].mode} · ${formatPercent(insights.gatewayPerformance[0].successRate)}`
            : "—"
        }
        hint={
          insights.gatewayPerformance[0]
            ? `${insights.gatewayPerformance[0].count} payments`
            : "No gateway data"
        }
      />
    </div>
  );
});
