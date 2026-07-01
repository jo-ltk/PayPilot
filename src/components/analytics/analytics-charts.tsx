"use client";

import { memo } from "react";

import { TrendChart } from "@/components/analytics/trend-chart";
import { toChartRows, TrendChartInner } from "@/components/analytics/trend-chart-inner";
import { formatCurrency, formatPercent } from "@/lib/format";

interface AmountTrendChartProps {
  title: string;
  description: string;
  series: { date: string; amountPaise: number; count: number }[];
  kind: "area" | "bar";
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  csvFilename: string;
  pngFilename: string;
  ariaLabel: string;
  gradientId: string;
}

/** Amount-based trend chart (revenue, settlement, refund). */
export const AmountTrendChart = memo(function AmountTrendChart({
  title,
  description,
  series,
  kind,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  csvFilename,
  pngFilename,
  ariaLabel,
  gradientId,
}: AmountTrendChartProps) {
  const chartData = toChartRows(
    series.map((point) => ({ date: point.date, value: point.amountPaise })),
  );
  const isEmpty = chartData.length === 0;
  const csvRows = series.map((point) => ({
    date: point.date,
    amountPaise: point.amountPaise,
    count: point.count,
  }));

  return (
    <TrendChart
      title={title}
      description={description}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      isEmpty={isEmpty}
      onRetry={onRetry}
      csvFilename={csvFilename}
      pngFilename={pngFilename}
      csvRows={csvRows}
      csvColumns={[
        { header: "Date", key: "date" },
        { header: "Amount (paise)", key: "amountPaise" },
        { header: "Count", key: "count" },
      ]}
    >
      <TrendChartInner
        data={chartData}
        kind={kind}
        valueLabel={title}
        formatValue={formatCurrency}
        ariaLabel={ariaLabel}
        gradientId={gradientId}
      />
    </TrendChart>
  );
});

interface RateTrendChartProps {
  title: string;
  description: string;
  series: { date: string; rate: number }[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  csvFilename: string;
  pngFilename: string;
  ariaLabel: string;
}

/** Percentage rate trend chart (match rate, success rate). */
export const RateTrendChart = memo(function RateTrendChart({
  title,
  description,
  series,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  csvFilename,
  pngFilename,
  ariaLabel,
}: RateTrendChartProps) {
  const chartData = toChartRows(
    series.map((point) => ({ date: point.date, value: point.rate })),
  );
  const isEmpty = chartData.length === 0;
  const csvRows = series.map((point) => ({
    date: point.date,
    rate: point.rate.toFixed(1),
  }));

  return (
    <TrendChart
      title={title}
      description={description}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      isEmpty={isEmpty}
      onRetry={onRetry}
      csvFilename={csvFilename}
      pngFilename={pngFilename}
      csvRows={csvRows}
      csvColumns={[
        { header: "Date", key: "date" },
        { header: "Rate (%)", key: "rate" },
      ]}
    >
      <TrendChartInner
        data={chartData}
        kind="line"
        valueLabel={title}
        formatValue={(value) => formatPercent(value)}
        ariaLabel={ariaLabel}
        gradientId="rateTrend"
      />
    </TrendChart>
  );
});
