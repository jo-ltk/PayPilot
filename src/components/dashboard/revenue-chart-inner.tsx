"use client";

import { memo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency, formatDate } from "@/lib/format";
import type { AnalyticsSeriesPoint } from "@/schemas/analytics.schema";

interface RevenueChartInnerProps {
  series: AnalyticsSeriesPoint[];
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

/** Recharts area chart for daily revenue volume. */
export const RevenueChartInner = memo(function RevenueChartInner({
  series,
}: RevenueChartInnerProps) {
  const chartData = series.map((point) => ({
    date: point.date,
    label: formatDate(point.date, "dd MMM"),
    grossPaise: point.grossPaise,
  }));

  return (
    <div
      className="h-64 w-full"
      role="img"
      aria-label="Revenue overview chart"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--foreground)" stopOpacity={0.12} />
              <stop offset="95%" stopColor="var(--foreground)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
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
              "Revenue",
            ]}
            labelFormatter={(label) => String(label)}
            contentStyle={{
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              background: "var(--background)",
            }}
          />
          <Area
            type="monotone"
            dataKey="grossPaise"
            stroke="var(--foreground)"
            fill="url(#revenueFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});
