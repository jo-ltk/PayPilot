"use client";

import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs value={activePreset} onValueChange={handlePresetChange}>
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start gap-1 sm:w-auto"
        >
          {ANALYTICS_RANGE_PRESETS.map((preset) => (
            <TabsTrigger key={preset.id} value={preset.id}>
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
        />
      ) : null}
    </div>
  );
}
