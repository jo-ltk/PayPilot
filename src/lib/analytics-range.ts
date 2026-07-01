import {
  endOfDay,
  startOfDay,
  subDays,
} from "date-fns";

import type { DateRange } from "@/types/common";

/** Preset identifiers for analytics date range tabs. */
export type AnalyticsRangePreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "custom";

/** Tab label and preset metadata for analytics comparisons. */
export const ANALYTICS_RANGE_PRESETS: {
  id: AnalyticsRangePreset;
  label: string;
}[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "custom", label: "Custom" },
];

/**
 * Resolves a preset id to an inclusive date range.
 * @param preset - Selected preset
 * @param reference - Anchor date (defaults to now)
 * @returns Inclusive from/to bounds
 */
export function resolveAnalyticsPreset(
  preset: Exclude<AnalyticsRangePreset, "custom">,
  reference = new Date(),
): DateRange {
  const now = reference;

  if (preset === "today") {
    return { from: startOfDay(now), to: endOfDay(now) };
  }

  if (preset === "yesterday") {
    const day = subDays(now, 1);
    return { from: startOfDay(day), to: endOfDay(day) };
  }

  if (preset === "7d") {
    return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
  }

  return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
}

/** Default analytics range: last 30 days. */
export function defaultAnalyticsRange(): DateRange {
  return resolveAnalyticsPreset("30d");
}

/**
 * Detects which preset matches a date range, if any.
 * @param range - Current date range
 * @returns Matching preset or custom
 */
export function detectAnalyticsPreset(
  range: DateRange,
): AnalyticsRangePreset {
  if (!range.from || !range.to) {
    return "custom";
  }

  for (const preset of ["today", "yesterday", "7d", "30d"] as const) {
    const resolved = resolveAnalyticsPreset(preset);
    if (
      resolved.from?.getTime() === range.from.getTime() &&
      resolved.to?.getTime() === range.to.getTime()
    ) {
      return preset;
    }
  }

  return "custom";
}
