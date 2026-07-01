"use client";

import dynamic from "next/dynamic";
import { memo } from "react";

import { TrendChart } from "@/components/analytics/trend-chart";
import type { GatewayPerformance } from "@/lib/analytics-metrics";

const GatewayBreakdownChartInner = dynamic(
  () =>
    import("@/components/analytics/gateway-breakdown-chart-inner").then(
      (mod) => mod.GatewayBreakdownChartInner,
    ),
  { ssr: false },
);

interface GatewayBreakdownChartProps {
  data?: GatewayPerformance[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

/** Gateway mode performance bar chart for analytics insights. */
export const GatewayBreakdownChart = memo(function GatewayBreakdownChart({
  data,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: GatewayBreakdownChartProps) {
  const rows = data ?? [];
  const isEmpty = rows.length === 0;
  const csvRows = rows.map((row) => ({
    mode: row.mode,
    count: row.count,
    volumePaise: row.volumePaise,
    successRate: row.successRate.toFixed(1),
  }));

  return (
    <TrendChart
      title="Gateway Performance"
      description="Volume and success rate by payment mode"
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      isEmpty={isEmpty}
      onRetry={onRetry}
      csvFilename="gateway-performance.csv"
      pngFilename="gateway-performance.png"
      csvRows={csvRows}
      csvColumns={[
        { header: "Mode", key: "mode" },
        { header: "Count", key: "count" },
        { header: "Volume (paise)", key: "volumePaise" },
        { header: "Success Rate (%)", key: "successRate" },
      ]}
    >
      <GatewayBreakdownChartInner data={rows} />
    </TrendChart>
  );
});
