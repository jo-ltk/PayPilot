import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

/**
 * Converts integer paise to a localized currency string.
 * @param paise - Amount in minor units (paise)
 * @param currency - ISO currency code
 * @returns Formatted currency string
 */
export function formatCurrency(paise: number, currency = "INR"): string {
  const major = paise / 100;

  if (currency === "INR") {
    return INR_FORMATTER.format(major);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(major);
}

/**
 * Formats an ISO date string or Date as a readable date.
 * @param value - ISO string or Date
 * @param pattern - date-fns format pattern
 * @returns Formatted date string
 */
export function formatDate(
  value: string | Date,
  pattern = "dd MMM yyyy",
): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) {
    return "—";
  }
  return format(date, pattern);
}

/**
 * Formats a timestamp as relative time (e.g. "3 hours ago").
 * @param value - ISO string or Date
 * @returns Relative time string
 */
export function formatRelativeTime(value: string | Date): string {
  const date = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(date)) {
    return "—";
  }
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Formats a number with locale-aware grouping.
 * @param value - Numeric value
 * @param options - Optional Intl.NumberFormat options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat("en-IN", options).format(value);
}

/**
 * Formats a percentage value (0–100 scale).
 * @param value - Percentage value
 * @param fractionDigits - Decimal places
 * @returns Formatted percentage string
 */
export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`;
}
