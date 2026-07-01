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

import { AnimatedNumber } from "@/components/analytics/animated-number";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingSkeleton key={`overview-skeleton-${index}`} variant="card" />
        ))}
      </div>
    );
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
      {items.map((item) => (
        <motion.div
          key={item.key}
          variants={kpiCardVariants}
          transition={prefersReducedMotion ? reducedMotionTransition : undefined}
        >
          <Card className="border-border/80 shadow-none transition-colors hover:bg-muted/30">
            <CardHeader className="gap-1 pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardDescription>{item.title}</CardDescription>
                <item.icon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                <AnimatedNumber value={item.value} format={item.format} />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
});
