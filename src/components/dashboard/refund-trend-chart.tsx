"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { memo } from "react";

import { ChartShell } from "@/components/dashboard/chart-shell";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { chartFadeVariants, reducedMotionTransition } from "@/lib/animations";
import type { TrendPoint } from "@/lib/dashboard";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

const RefundTrendChartInner = dynamic(
  () =>
    import("@/components/dashboard/refund-trend-chart-inner").then(
      (mod) => mod.RefundTrendChartInner,
    ),
  {
    ssr: false,
    loading: () => <LoadingSkeleton variant="chart" />,
  },
);

interface RefundTrendChartProps {
  series?: TrendPoint[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

/** Lazy-loaded refund trend chart with state handling. */
export const RefundTrendChart = memo(function RefundTrendChart({
  series,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: RefundTrendChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const isEmpty = !series || series.length === 0;
  const tableRows = (series ?? []).map((point) => ({
    date: formatDate(point.date),
    amount: formatCurrency(point.amountPaise),
    refunds: formatNumber(point.count),
  }));

  return (
    <ChartShell
      title="Refund Trend"
      description="Customer refunds over the selected period"
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      isEmpty={isEmpty}
      onRetry={onRetry}
      tableCaption="Refund trend data by day"
      tableColumns={[
        { header: "Date", key: "date" },
        { header: "Amount", key: "amount", align: "right" },
        { header: "Refunds", key: "refunds", align: "right" },
      ]}
      tableRows={tableRows}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={chartFadeVariants}
        transition={prefersReducedMotion ? reducedMotionTransition : undefined}
      >
        <RefundTrendChartInner series={series ?? []} />
      </motion.div>
    </ChartShell>
  );
});
