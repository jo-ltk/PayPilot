"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { memo } from "react";

import { ChartShell } from "@/components/dashboard/chart-shell";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { chartFadeVariants, reducedMotionTransition } from "@/lib/animations";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import type { AnalyticsSeriesPoint } from "@/schemas/analytics.schema";

const RevenueChartInner = dynamic(
  () =>
    import("@/components/dashboard/revenue-chart-inner").then(
      (mod) => mod.RevenueChartInner,
    ),
  {
    ssr: false,
    loading: () => <LoadingSkeleton variant="chart" />,
  },
);

interface RevenueChartProps {
  series?: AnalyticsSeriesPoint[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

/** Lazy-loaded revenue overview chart with state handling. */
export const RevenueChart = memo(function RevenueChart({
  series,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: RevenueChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const isEmpty = !series || series.length === 0;
  const tableRows = (series ?? []).map((point) => ({
    date: formatDate(point.date),
    revenue: formatCurrency(point.grossPaise),
    transactions: formatNumber(point.count),
  }));

  return (
    <ChartShell
      title="Revenue Overview"
      description="Collected payments over the selected period"
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      isEmpty={isEmpty}
      onRetry={onRetry}
      tableCaption="Revenue overview data by day"
      tableColumns={[
        { header: "Date", key: "date" },
        { header: "Revenue", key: "revenue", align: "right" },
        { header: "Transactions", key: "transactions", align: "right" },
      ]}
      tableRows={tableRows}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={chartFadeVariants}
        transition={prefersReducedMotion ? reducedMotionTransition : undefined}
      >
        <RevenueChartInner series={series ?? []} />
      </motion.div>
    </ChartShell>
  );
});
