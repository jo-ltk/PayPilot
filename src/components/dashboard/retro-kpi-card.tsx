import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

interface RetroKpiCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: LucideIcon;
  className?: string;
}

const trendStyles = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-foreground/60",
} as const;

/** Retro "sticker" KPI card used only on the dashboard. */
export function RetroKpiCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  className,
}: RetroKpiCardProps) {
  const TrendIcon = trend?.direction === "down" ? TrendingDown : TrendingUp;

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-4 rounded-[1.5rem] border border-[var(--retro-ink)] p-5",
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
        {value}
      </p>
      {(description || trend) && (
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1">
          {trend ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold",
                trendStyles[trend.direction],
              )}
            >
              {trend.direction !== "neutral" ? (
                <TrendIcon aria-hidden="true" className="size-3" />
              ) : null}
              {trend.value}
            </span>
          ) : null}
          {description ? (
            <p className="text-xs text-foreground/60">{description}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
