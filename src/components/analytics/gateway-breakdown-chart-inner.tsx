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

import { formatCurrency, formatPercent } from "@/lib/format";
import type { GatewayPerformance } from "@/lib/analytics-metrics";

interface GatewayBreakdownChartInnerProps {
  data: GatewayPerformance[];
}

/** Horizontal bar chart comparing gateway modes by volume. */
export const GatewayBreakdownChartInner = memo(
  function GatewayBreakdownChartInner({
    data,
  }: GatewayBreakdownChartInnerProps) {
    const chartData = data.map((row) => ({
      mode: row.mode,
      volumePaise: row.volumePaise,
      successRate: row.successRate,
      label: `${row.mode} (${formatPercent(row.successRate)})`,
    }));

    return (
      <div
        className="h-64 w-full"
        role="img"
        aria-label="Gateway performance chart"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              horizontal={false}
            />
            <XAxis
              type="number"
              tickFormatter={(value) => formatCurrency(Number(value))}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              type="category"
              dataKey="mode"
              width={72}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              formatter={(value, _name, item) => [
                formatCurrency(Number(value ?? 0)),
                `${item?.payload?.mode ?? "Mode"} · ${formatPercent(Number(item?.payload?.successRate ?? 0))}`,
              ]}
              contentStyle={{
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                background: "var(--background)",
              }}
            />
            <Bar
              dataKey="volumePaise"
              fill="var(--foreground)"
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  },
);
