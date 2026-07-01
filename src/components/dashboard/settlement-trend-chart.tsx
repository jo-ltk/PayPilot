"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { memo } from "react";

import { ChartShell } from "@/components/dashboard/chart-shell";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { chartFadeVariants, reducedMotionTransition } from "@/lib/animations";
import type { TrendPoint } from "@/lib/dashboard";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

const SettlementTrendChartInner = dynamic(
  () =>
    import("@/components/dashboard/settlement-trend-chart-inner").then(
      (mod) => mod.SettlementTrendChartInner,
    ),
  {
    ssr: false,
    loading: () => <LoadingSkeleton variant="chart" />,
  },
);

interface SettlementTrendChartProps {
  series?: TrendPoint[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

/** Lazy-loaded settlement trend chart with state handling. */
export const SettlementTrendChart = memo(function SettlementTrendChart({
  series,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: SettlementTrendChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const isEmpty = !series || series.length === 0;
  const tableRows = (series ?? []).map((point) => ({
    date: formatDate(point.date),
    amount: formatCurrency(point.amountPaise),
    payouts: formatNumber(point.count),
  }));

  return (
    <ChartShell
      title="Settlement Trend"
      description="Daily payout volume to your bank"
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      isEmpty={isEmpty}
      onRetry={onRetry}
      tableCaption="Settlement trend data by day"
      tableColumns={[
        { header: "Date", key: "date" },
        { header: "Amount", key: "amount", align: "right" },
        { header: "Payouts", key: "payouts", align: "right" },
      ]}
      tableRows={tableRows}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={chartFadeVariants}
        transition={prefersReducedMotion ? reducedMotionTransition : undefined}
      >
        <SettlementTrendChartInner series={series ?? []} />
      </motion.div>
    </ChartShell>
  );
});
