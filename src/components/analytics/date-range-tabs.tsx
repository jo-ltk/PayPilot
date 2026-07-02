"use client";

import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ANALYTICS_RANGE_PRESETS,
  detectAnalyticsPreset,
  resolveAnalyticsPreset,
  type AnalyticsRangePreset,
} from "@/lib/analytics-range";
import type { DateRange } from "@/types/common";

interface DateRangeTabsProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

/**
 * Preset date range tabs with optional custom picker.
 * @param props - Current range and change handler
 */
export function DateRangeTabs({ value, onChange }: DateRangeTabsProps) {
  const activePreset = detectAnalyticsPreset(value);

  const handlePresetChange = (preset: string) => {
    const id = preset as AnalyticsRangePreset;

    if (id === "custom") {
      return;
    }

    onChange(resolveAnalyticsPreset(id));
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Tabs value={activePreset} onValueChange={handlePresetChange} className="w-full min-w-0">
        <TabsList
          variant="default"
          className={cn(
            "retro-analytics-tabs h-auto w-full gap-2 rounded-none bg-transparent p-0",
            "group-data-horizontal/tabs:h-auto",
            "grid grid-cols-2 sm:flex sm:flex-row sm:flex-wrap",
          )}
        >
          {ANALYTICS_RANGE_PRESETS.map((preset) => (
            <TabsTrigger
              key={preset.id}
              value={preset.id}
              className={cn(
                "retro-pill h-9 w-full flex-none rounded-full border-transparent px-2 text-xs font-medium shadow-none sm:w-auto sm:px-3 sm:text-sm",
                "after:hidden focus-visible:ring-2 focus-visible:ring-ring/25",
                "data-active:bg-[var(--retro-blue)] data-active:text-[var(--retro-chart-strong)]",
                "hover:bg-[color-mix(in_oklch,var(--secondary)_70%,var(--card))]",
              )}
            >
              {preset.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {activePreset === "custom" ? (
        <DateRangePicker
          value={value}
          onChange={onChange}
          placeholder="Custom range"
          variant="chip"
          className="h-11 shrink-0"
        />
      ) : null}
    </div>
  );
}
