"use client";

import type { LucideIcon } from "lucide-react";
import { memo } from "react";

import { AnimatedNumber } from "@/components/analytics/animated-number";
import { cn } from "@/lib/utils";

interface AnalyticsKpiCardProps {
  title: string;
  value: number;
  format: (value: number) => string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

/** Retro KPI card with animated metrics for the analytics overview grid. */
export const AnalyticsKpiCard = memo(function AnalyticsKpiCard({
  title,
  value,
  format,
  description,
  icon: Icon,
  className,
}: AnalyticsKpiCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-4 rounded-[1.5rem] border border-[var(--retro-ink)] p-5 transition-colors hover:bg-[color-mix(in_oklch,var(--secondary)_50%,var(--card))]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground/70">{title}</p>
        {Icon ? (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--retro-chip,var(--retro-ink))] text-[var(--retro-chip-foreground,#fbf6ec)]">
            <Icon aria-hidden="true" className="size-4" />
          </span>
        ) : null}
      </div>
      <p className="font-retro text-3xl font-medium tracking-tight text-foreground xl:text-4xl">
        <AnimatedNumber value={value} format={format} />
      </p>
      {description ? (
        <p className="mt-auto text-xs text-foreground/60">{description}</p>
      ) : null}
    </div>
  );
});
