"use client";

import { memo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TrendPoint } from "@/lib/dashboard";
import { formatCurrency, formatDate } from "@/lib/format";

interface SettlementTrendChartInnerProps {
  series: TrendPoint[];
}

function formatAxisValue(paise: number): string {
  const major = paise / 100;
  if (major >= 100_000) {
    return `₹${(major / 100_000).toFixed(1)}L`;
  }
  if (major >= 1_000) {
    return `₹${(major / 1_000).toFixed(0)}K`;
  }
  return `₹${major.toFixed(0)}`;
}

/** Recharts bar chart for daily settlement volume. */
export const SettlementTrendChartInner = memo(
  function SettlementTrendChartInner({
    series,
  }: SettlementTrendChartInnerProps) {
    const chartData = series.map((point) => ({
      ...point,
      label: formatDate(point.date, "dd MMM"),
    }));

    return (
      <div
        className="h-64 w-full"
        role="img"
        aria-label="Settlement trend chart"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              tickFormatter={formatAxisValue}
              tickLine={false}
              axisLine={false}
              width={56}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              formatter={(value) => [
                formatCurrency(Number(value ?? 0)),
                "Settled",
              ]}
              labelFormatter={(label) => String(label)}
              contentStyle={{
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                background: "var(--background)",
              }}
            />
            <Bar
              dataKey="amountPaise"
              fill="var(--foreground)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  },
);
