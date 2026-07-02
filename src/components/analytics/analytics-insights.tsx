"use client";

import { memo } from "react";

import { AnalyticsInsightCard } from "@/components/analytics/analytics-insight-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, formatPercent } from "@/lib/format";
import type { AnalyticsInsightsData } from "@/hooks/use-analytics-insights";

interface AnalyticsInsightsProps {
  insights?: AnalyticsInsightsData;
  isLoading: boolean;
}

const retroInsightStyles = [
  "bg-[var(--retro-blue)]",
  "bg-[var(--retro-yellow)]",
  "bg-[var(--retro-mint)]",
  "bg-[var(--retro-lilac)]",
  "bg-[var(--retro-pink)]",
];

function InsightsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={`insight-skeleton-${index}`}
          className="flex flex-col gap-3 rounded-[1.5rem] border border-[var(--retro-ink)] p-5"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Insight cards derived from analytics and list APIs. */
export const AnalyticsInsights = memo(function AnalyticsInsights({
  insights,
  isLoading,
}: AnalyticsInsightsProps) {
  if (isLoading || !insights) {
    return <InsightsSkeleton />;
  }

  const topDay = insights.topPaymentDays[0];
  const largest = insights.largestSettlement;

  const items = [
    {
      key: "top-day",
      label: "Top payment day",
      value: topDay ? formatCurrency(topDay.grossPaise) : "—",
      hint: topDay ? formatDate(topDay.date) : "No payment activity",
    },
    {
      key: "largest-settlement",
      label: "Largest settlement",
      value: largest ? formatCurrency(largest.totalAmountPaise) : "—",
      hint: largest ? formatDate(largest.payoutDate) : "No settlements yet",
    },
    {
      key: "refund-percentage",
      label: "Refund percentage",
      value: formatPercent(insights.refundPercentage),
      hint: "Of gross revenue in period",
    },
    {
      key: "settlement-time",
      label: "Average settlement time",
      value:
        insights.averageSettlementDays !== null
          ? `${insights.averageSettlementDays} days`
          : "—",
      hint: "Estimated payout lag",
    },
    {
      key: "gateway",
      label: "Gateway performance",
      value: insights.gatewayPerformance[0]
        ? `${insights.gatewayPerformance[0].mode} · ${formatPercent(insights.gatewayPerformance[0].successRate)}`
        : "—",
      hint: insights.gatewayPerformance[0]
        ? `${insights.gatewayPerformance[0].count} payments`
        : "No gateway data",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <AnalyticsInsightCard
          key={item.key}
          label={item.label}
          value={item.value}
          hint={item.hint}
          className={retroInsightStyles[index % retroInsightStyles.length]}
        />
      ))}
    </div>
  );
});
