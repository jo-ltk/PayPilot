"use client";

import { memo } from "react";

import { cn } from "@/lib/utils";

interface AnalyticsInsightCardProps {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}

/** Retro insight card for the analytics findings grid. */
export const AnalyticsInsightCard = memo(function AnalyticsInsightCard({
  label,
  value,
  hint,
  className,
}: AnalyticsInsightCardProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col gap-3 rounded-[1.5rem] border border-[var(--retro-ink)] p-5 transition-colors hover:bg-[color-mix(in_oklch,var(--secondary)_50%,var(--card))]",
        className,
      )}
    >
      <p className="text-sm font-medium text-foreground/70">{label}</p>
      <p className="font-retro text-2xl font-medium tracking-tight text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-auto text-xs text-foreground/60">{hint}</p> : null}
    </div>
  );
});
