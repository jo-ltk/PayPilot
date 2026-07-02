"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  Banknote,
  HeartPulse,
  Percent,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { memo } from "react";

import { AnalyticsKpiCard } from "@/components/analytics/analytics-kpi-card";
import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeMatchRate } from "@/lib/analytics-metrics";
import {
  kpiCardVariants,
  kpiGridVariants,
  reducedMotionTransition,
} from "@/lib/animations";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { AnalyticsInsightsData } from "@/hooks/use-analytics-insights";
import type { AnalyticsResponse } from "@/schemas/analytics.schema";

interface AnalyticsOverviewProps {
  data?: AnalyticsResponse;
  insights?: AnalyticsInsightsData;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

const retroCardStyles = [
  "bg-[var(--retro-pink)]",
  "bg-[var(--retro-blue)]",
  "bg-[var(--retro-yellow)]",
  "bg-[var(--retro-mint)]",
  "bg-[var(--retro-lilac)]",
  "bg-[var(--retro-pink)]",
];

function buildOverviewItems(
  data: AnalyticsResponse,
  insights: AnalyticsInsightsData,
) {
  return [
    {
      key: "revenue",
      title: "Revenue Analytics",
      value: data.kpis.grossVolumePaise,
      format: formatCurrency,
      description: `${formatNumber(data.kpis.transactionCount)} transactions`,
      icon: TrendingUp,
    },
    {
      key: "settlement",
      title: "Settlement Analytics",
      value: data.kpis.settlementTotalPaise,
      format: formatCurrency,
      description: `${formatNumber(data.kpis.settlementCount)} payouts`,
      icon: Banknote,
    },
    {
      key: "refund",
      title: "Refund Analytics",
      value: data.kpis.refundTotalPaise,
      format: formatCurrency,
      description: `${formatNumber(data.kpis.refundCount)} refunds`,
      icon: RotateCcw,
    },
    {
      key: "match-rate",
      title: "Match Rate",
      value: normalizeMatchRate(data.kpis.matchRate),
      format: (value: number) => formatPercent(value),
      description: "Reconciliation accuracy",
      icon: Percent,
    },
    {
      key: "success-rate",
      title: "Success Rate",
      value: insights.successRate,
      format: (value: number) => formatPercent(value),
      description: "Successful payments",
      icon: Activity,
    },
    {
      key: "health",
      title: "Payment Health Score",
      value: insights.paymentHealthScore,
      format: (value: number) => formatNumber(Math.round(value)),
      description: "Composite health index",
      icon: HeartPulse,
    },
  ];
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`overview-skeleton-${index}`}
          className="flex flex-col gap-4 rounded-[1.5rem] border border-[var(--retro-ink)] p-5"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Six-card analytics overview with animated metrics. */
export const AnalyticsOverview = memo(function AnalyticsOverview({
  data,
  insights,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: AnalyticsOverviewProps) {
  const prefersReducedMotion = useReducedMotion();

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Overview unavailable"
        message={errorMessage ?? "Failed to load analytics overview"}
        onRetry={onRetry}
      />
    );
  }

  if (!data || !insights) {
    return null;
  }

  const items = buildOverviewItems(data, insights);

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={kpiGridVariants}
      transition={prefersReducedMotion ? reducedMotionTransition : undefined}
    >
      {items.map((item, index) => (
        <motion.div
          key={item.key}
          variants={kpiCardVariants}
          transition={prefersReducedMotion ? reducedMotionTransition : undefined}
        >
          <AnalyticsKpiCard
            title={item.title}
            value={item.value}
            format={item.format}
            description={item.description}
            icon={item.icon}
            className={retroCardStyles[index % retroCardStyles.length]}
          />
        </motion.div>
      ))}
    </motion.div>
  );
});
