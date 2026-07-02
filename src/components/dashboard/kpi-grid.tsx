"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Banknote,
  Clock,
  IndianRupee,
  RotateCcw,
} from "lucide-react";
import { memo } from "react";

import { KpiCardSkeleton } from "@/components/dashboard/kpi-card";
import { RetroKpiCard } from "@/components/dashboard/retro-kpi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  computeSeriesTrend,
  countSettlementMismatches,
} from "@/lib/dashboard";
import { formatCurrency, formatNumber } from "@/lib/format";
import {
  kpiCardVariants,
  kpiGridVariants,
  reducedMotionTransition,
} from "@/lib/animations";
import type { AnalyticsResponse } from "@/schemas/analytics.schema";

interface KpiGridProps {
  data?: AnalyticsResponse;
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
];

function buildKpiItems(data: AnalyticsResponse) {
  const salesTrend = computeSeriesTrend(data.series);
  const mismatchCount = countSettlementMismatches(data.kpis.reconciliation);

  return [
    {
      key: "sales",
      title: "Today's Sales",
      value: formatCurrency(data.kpis.grossVolumePaise),
      description: `${formatNumber(data.kpis.transactionCount)} transactions`,
      trend: salesTrend,
      icon: IndianRupee,
    },
    {
      key: "settled",
      title: "Settled Amount",
      value: formatCurrency(data.kpis.settlementTotalPaise),
      description: `${formatNumber(data.kpis.settlementCount)} payouts`,
      trend: {
        direction: "neutral" as const,
        value: "Funds in bank",
      },
      icon: Banknote,
    },
    {
      key: "pending",
      title: "Pending Settlement",
      value: formatCurrency(data.kpis.pendingSettlementPaise),
      description: "Awaiting payout",
      trend: {
        direction:
          data.kpis.pendingSettlementPaise > 0
            ? ("down" as const)
            : ("neutral" as const),
        value:
          data.kpis.pendingSettlementPaise > 0 ? "Needs attention" : "All clear",
      },
      icon: Clock,
    },
    {
      key: "refunds",
      title: "Refunds",
      value: formatCurrency(data.kpis.refundTotalPaise),
      description: `${formatNumber(data.kpis.refundCount)} refunds`,
      trend: {
        direction: "neutral" as const,
        value: "Customer returns",
      },
      icon: RotateCcw,
    },
    {
      key: "mismatches",
      title: "Settlement Mismatches",
      value: formatNumber(mismatchCount),
      description: "Open reconciliation issues",
      trend: {
        direction:
          mismatchCount > 0 ? ("down" as const) : ("up" as const),
        value: mismatchCount > 0 ? "Review required" : "Fully matched",
      },
      icon: AlertTriangle,
    },
  ];
}

/** Five KPI cards wired to analytics data with entrance animations. */
export const KpiGrid = memo(function KpiGrid({
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: KpiGridProps) {
  const prefersReducedMotion = useReducedMotion();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <KpiCardSkeleton key={`kpi-skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="KPIs unavailable"
        message={errorMessage ?? "Failed to load dashboard metrics"}
        onRetry={onRetry}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={IndianRupee}
        title="No metrics yet"
        description="Payment activity will appear here once transactions are recorded."
      />
    );
  }

  const items = buildKpiItems(data);

  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
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
          <RetroKpiCard
            title={item.title}
            value={item.value}
            description={item.description}
            trend={item.trend}
            icon={item.icon}
            className={retroCardStyles[index % retroCardStyles.length]}
          />
        </motion.div>
      ))}
    </motion.div>
  );
});
