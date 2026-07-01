import { ReconciliationStatus } from "@prisma/client";

import type { StatusVariant } from "@/components/shared/status-badge";
import type { SelectOption } from "@/types/common";

/** Status filter options for the reconciliation toolbar. */
export const RECONCILIATION_STATUS_OPTIONS: SelectOption[] = [
  { value: ReconciliationStatus.MATCHED, label: "Settled" },
  { value: ReconciliationStatus.PENDING_SETTLEMENT, label: "Pending" },
  { value: ReconciliationStatus.AMOUNT_MISMATCH, label: "Mismatch" },
  { value: ReconciliationStatus.REFUND_MISMATCH, label: "Refund Mismatch" },
  { value: ReconciliationStatus.MISSING_GATEWAY, label: "Missing Gateway" },
  { value: ReconciliationStatus.MISSING_SHOPIFY, label: "Missing Shopify" },
  { value: ReconciliationStatus.RESOLVED, label: "Resolved" },
];

/** Refund status filter options for the refunds toolbar. */
export const REFUND_STATUS_OPTIONS: SelectOption[] = [
  { value: "processed", label: "Processed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const STATUS_LABELS: Record<ReconciliationStatus, string> = {
  [ReconciliationStatus.MATCHED]: "Settled",
  [ReconciliationStatus.PENDING_SETTLEMENT]: "Pending",
  [ReconciliationStatus.AMOUNT_MISMATCH]: "Mismatch",
  [ReconciliationStatus.REFUND_MISMATCH]: "Refund Mismatch",
  [ReconciliationStatus.MISSING_GATEWAY]: "Missing Gateway",
  [ReconciliationStatus.MISSING_SHOPIFY]: "Missing Shopify",
  [ReconciliationStatus.RESOLVED]: "Resolved",
};

/**
 * Maps a reconciliation status to a human-readable label.
 * @param status - Prisma reconciliation status
 * @returns Display label
 */
export function getReconciliationStatusLabel(
  status: ReconciliationStatus,
): string {
  return STATUS_LABELS[status] ?? status;
}

/**
 * Maps a reconciliation status to a semantic badge variant.
 * @param status - Prisma reconciliation status
 * @returns Status badge variant
 */
export function getReconciliationStatusVariant(
  status: ReconciliationStatus,
): StatusVariant {
  if (
    status === ReconciliationStatus.MATCHED ||
    status === ReconciliationStatus.RESOLVED
  ) {
    return "success";
  }

  if (status === ReconciliationStatus.PENDING_SETTLEMENT) {
    return "pending";
  }

  if (
    status === ReconciliationStatus.AMOUNT_MISMATCH ||
    status === ReconciliationStatus.REFUND_MISMATCH ||
    status === ReconciliationStatus.MISSING_GATEWAY ||
    status === ReconciliationStatus.MISSING_SHOPIFY
  ) {
    return "error";
  }

  return "neutral";
}

/**
 * Whether a reconciliation record can be manually resolved.
 * @param status - Prisma reconciliation status
 * @returns True when resolve action applies
 */
export function isResolvableStatus(status: ReconciliationStatus): boolean {
  return (
    status !== ReconciliationStatus.MATCHED &&
    status !== ReconciliationStatus.RESOLVED
  );
}

/**
 * Whether a status represents an open mismatch.
 * @param status - Prisma reconciliation status
 * @returns True for unresolved mismatch statuses
 */
export function isMismatchStatus(status: ReconciliationStatus): boolean {
  return (
    status === ReconciliationStatus.AMOUNT_MISMATCH ||
    status === ReconciliationStatus.REFUND_MISMATCH ||
    status === ReconciliationStatus.MISSING_GATEWAY ||
    status === ReconciliationStatus.MISSING_SHOPIFY
  );
}

/**
 * Whether a status should show a pending pulse animation.
 * @param status - Prisma reconciliation status
 * @returns True for pending settlement
 */
export function isPendingReconciliationStatus(
  status: ReconciliationStatus,
): boolean {
  return status === ReconciliationStatus.PENDING_SETTLEMENT;
}
