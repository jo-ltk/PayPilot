"use client";

import { Role } from "@prisma/client";
import { RefreshCw, Scale } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { DetailField } from "@/components/shared/detail-field";
import { MismatchBadge } from "@/components/reconciliation/mismatch-badge";
import { ReconciliationAmountComparison } from "@/components/reconciliation/reconciliation-amount-comparison";
import { ReconciliationTimeline } from "@/components/reconciliation/reconciliation-timeline";
import { getSettlementColumnLabel } from "@/lib/filter-reconciliation-rows";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { drawerContentVariants, reducedMotionTransition } from "@/lib/animations";
import { hasRole } from "@/lib/auth/rbac";
import { isResolvableStatus } from "@/lib/reconciliation-status";
import type { ReconciliationView } from "@/schemas/payments.schema";

interface ReconciliationDetailSheetProps {
  record: ReconciliationView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onRefresh?: () => void;
  onResolve?: (record: ReconciliationView) => void;
}

/** Side drawer showing full reconciliation record details. */
export function ReconciliationDetailSheet({
  record,
  open,
  onOpenChange,
  role,
  onRefresh,
  onResolve,
}: ReconciliationDetailSheetProps) {
  const prefersReducedMotion = useReducedMotion();
  const canResolve = role != null && hasRole(role, Role.ADMIN);
  const showResolve =
    record != null && canResolve && isResolvableStatus(record.status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {record ? (
          <motion.div
            className="flex h-full flex-col gap-6"
            variants={drawerContentVariants}
            initial="hidden"
            animate="visible"
            transition={prefersReducedMotion ? reducedMotionTransition : undefined}
          >
            <SheetHeader>
              <SheetTitle>Reconciliation details</SheetTitle>
              <SheetDescription>
                Order, transaction, and settlement comparison.
              </SheetDescription>
            </SheetHeader>

            <dl className="flex-1 space-y-4 px-4">
              <DetailField label="Record ID" value={record.id} copyable />
              <section className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Shopify order
                </h3>
                <DetailField
                  label="Order ID"
                  value={record.shopifyOrderId ?? "—"}
                  copyable={Boolean(record.shopifyOrderId)}
                />
              </section>
              <section className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Gateway transaction
                </h3>
                <DetailField
                  label="Transaction ID"
                  value={record.transactionId ?? "—"}
                  copyable={Boolean(record.transactionId)}
                />
              </section>
              <section className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Settlement
                </h3>
                <DetailField
                  label="Status"
                  value={getSettlementColumnLabel(record.status)}
                />
              </section>
              <section className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Matching strategy
                </h3>
                <DetailField
                  label="Strategy"
                  value={record.reason ?? "Auto-match (composite)"}
                />
              </section>
              <section className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Amount comparison
                </h3>
                <ReconciliationAmountComparison record={record} />
              </section>
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </dt>
                <dd>
                  <MismatchBadge status={record.status} />
                </dd>
              </div>
              {record.reason ? (
                <DetailField label="Reason" value={record.reason} />
              ) : null}
              <section className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Timeline
                </h3>
                <ReconciliationTimeline record={record} />
              </section>
              {record.resolvedAt ? (
                <section className="space-y-2">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Resolution history
                  </h3>
                  <DetailField
                    label="Resolved at"
                    value={record.resolvedAt}
                  />
                  {record.resolvedByUserId ? (
                    <DetailField
                      label="Resolved by"
                      value={record.resolvedByUserId}
                      copyable
                    />
                  ) : null}
                </section>
              ) : null}
            </dl>

            <SheetFooter className="flex-row flex-wrap gap-2">
              {onRefresh ? (
                <Button type="button" variant="outline" onClick={onRefresh}>
                  <RefreshCw aria-hidden="true" className="size-4" />
                  Refresh
                </Button>
              ) : null}
              {showResolve && onResolve ? (
                <Button type="button" onClick={() => onResolve(record)}>
                  <Scale aria-hidden="true" className="size-4" />
                  Resolve mismatch
                </Button>
              ) : null}
            </SheetFooter>
          </motion.div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
