import type { StatusVariant } from "@/components/shared/status-badge";
import type { SelectOption } from "@/types/common";

/** Payment status filter options for the transactions toolbar. */
export const PAYMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: "success", label: "Success" },
  { value: "failure", label: "Failed" },
  { value: "pending", label: "Pending" },
  { value: "userCancelled", label: "Cancelled" },
];

/** Settlement status filter options. */
export const SETTLEMENT_STATUS_OPTIONS: SelectOption[] = [
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

/**
 * Maps a payment status string to a semantic badge variant.
 * @param status - Raw gateway status
 * @returns Status badge variant
 */
export function getPaymentStatusVariant(status: string): StatusVariant {
  const normalized = status.toLowerCase();

  if (normalized === "success" || normalized === "captured") {
    return "success";
  }

  if (
    normalized === "pending" ||
    normalized === "initiated" ||
    normalized === "processing"
  ) {
    return "pending";
  }

  if (
    normalized === "failure" ||
    normalized === "failed" ||
    normalized === "usercancelled"
  ) {
    return "error";
  }

  return "neutral";
}

/**
 * Maps a settlement status string to a semantic badge variant.
 * @param status - Raw settlement status
 * @returns Status badge variant
 */
export function getSettlementStatusVariant(status: string): StatusVariant {
  const normalized = status.toLowerCase();

  if (normalized === "completed" || normalized === "success") {
    return "success";
  }

  if (normalized === "pending" || normalized === "processing") {
    return "warning";
  }

  if (normalized === "failed" || normalized === "failure") {
    return "error";
  }

  return "neutral";
}

/**
 * Formats a raw status string for display.
 * @param status - Raw status value
 * @returns Human-readable label
 */
export function formatStatusLabel(status: string): string {
  if (!status) {
    return "Unknown";
  }

  return status
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
