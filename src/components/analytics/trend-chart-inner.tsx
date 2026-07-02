"use client";

import { memo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatDate, formatPercent } from "@/lib/format";

type ChartKind = "area" | "bar" | "line";

interface TrendChartInnerProps {
  data: { date: string; label: string; value: number }[];
  kind: ChartKind;
  valueLabel: string;
  formatValue: (value: number) => string;
  ariaLabel: string;
  gradientId: string;
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

function renderChart(
  kind: ChartKind,
  data: TrendChartInnerProps["data"],
  valueLabel: string,
  formatValue: (value: number) => string,
  gradientId: string,
) {
  const axisProps = {
    tickLine: false as const,
    axisLine: false as const,
    tick: { fontSize: 12, fill: "var(--muted-foreground)" },
  };

  if (kind === "bar") {
    return (
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis tickFormatter={formatAxisValue} width={56} {...axisProps} />
        <Tooltip
          formatter={(value) => [formatValue(Number(value ?? 0)), valueLabel]}
          contentStyle={{
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            background: "var(--background)",
          }}
        />
        <Bar
          dataKey="value"
          fill="var(--retro-chart-strong, var(--foreground))"
          radius={[4, 4, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    );
  }

  if (kind === "line") {
    return (
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis tickFormatter={(v) => formatPercent(Number(v))} width={48} domain={[0, 100]} {...axisProps} />
        <Tooltip
          formatter={(value) => [formatPercent(Number(value ?? 0)), valueLabel]}
          contentStyle={{
            borderRadius: "var(--radius)",
            border: "1px solid var(--border)",
            background: "var(--background)",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--retro-chart-strong, var(--foreground))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    );
  }

  return (
    <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="5%"
            stopColor="var(--retro-chart-strong, var(--foreground))"
            stopOpacity={0.35}
          />
          <stop
            offset="95%"
            stopColor="var(--retro-chart-strong, var(--foreground))"
            stopOpacity={0.03}
          />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
      <XAxis dataKey="label" {...axisProps} />
      <YAxis tickFormatter={formatAxisValue} width={56} {...axisProps} />
      <Tooltip
        formatter={(value) => [formatValue(Number(value ?? 0)), valueLabel]}
        contentStyle={{
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          background: "var(--background)",
        }}
      />
      <Area
        type="monotone"
        dataKey="value"
        stroke="var(--retro-chart-strong, var(--foreground))"
        fill={`url(#${gradientId})`}
        strokeWidth={2}
      />
    </AreaChart>
  );
}

/** Generic Recharts visualization for analytics trend data. */
export const TrendChartInner = memo(function TrendChartInner({
  data,
  kind,
  valueLabel,
  formatValue,
  ariaLabel,
  gradientId,
}: TrendChartInnerProps) {
  return (
    <div className="h-64 w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart(kind, data, valueLabel, formatValue, gradientId)}
      </ResponsiveContainer>
    </div>
  );
});

/** Maps dated values into chart rows with formatted labels. */
export function toChartRows(
  points: { date: string; value: number }[],
): { date: string; label: string; value: number }[] {
  return points.map((point) => ({
    ...point,
    label: formatDate(point.date, "dd MMM"),
  }));
}
