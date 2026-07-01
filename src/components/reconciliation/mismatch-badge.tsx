"use client";

import { ReconciliationStatus } from "@prisma/client";

import { StatusBadge } from "@/components/shared/status-badge";
import {
  getReconciliationStatusLabel,
  getReconciliationStatusVariant,
  isPendingReconciliationStatus,
} from "@/lib/reconciliation-status";
import { cn } from "@/lib/utils";

interface MismatchBadgeProps {
  status: ReconciliationStatus;
  className?: string;
}

/** Reconciliation-specific status badge with optional pending pulse. */
export function MismatchBadge({ status, className }: MismatchBadgeProps) {
  const pulse = isPendingReconciliationStatus(status);

  return (
    <StatusBadge
      label={getReconciliationStatusLabel(status)}
      variant={getReconciliationStatusVariant(status)}
      className={cn(pulse && "animate-pulse", className)}
    />
  );
}
