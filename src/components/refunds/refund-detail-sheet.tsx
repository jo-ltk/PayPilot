"use client";

import { RefreshCw } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { CurrencyDisplay } from "@/components/shared/currency-display";
import { DetailField } from "@/components/shared/detail-field";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { formatDate } from "@/lib/format";
import {
  formatStatusLabel,
  getPaymentStatusVariant,
} from "@/lib/payment-status";
import { cn } from "@/lib/utils";
import type { RefundView } from "@/schemas/payments.schema";

interface RefundDetailSheetProps {
  refund: RefundView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh?: () => void;
}

interface DetailSheetActionProps {
  label: string;
  chipClassName: string;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

function DetailSheetAction({
  label,
  chipClassName,
  children,
  onClick,
  disabled,
  ariaLabel,
}: DetailSheetActionProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      onClick={onClick}
      className="retro-pill h-11 w-full gap-2.5 border-transparent pl-1.5 pr-3"
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl text-[var(--retro-chart-strong)]",
          chipClassName,
        )}
      >
        {children}
      </span>
      <span className="truncate font-retro text-sm font-medium text-foreground">
        {label}
      </span>
    </Button>
  );
}

/** Side drawer showing full refund details and settlement impact. */
export function RefundDetailSheet({
  refund,
  open,
  onOpenChange,
  onRefresh,
}: RefundDetailSheetProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {refund ? (
          <motion.div
            className="flex h-full flex-col"
            variants={drawerContentVariants}
            initial="hidden"
            animate="visible"
            transition={prefersReducedMotion ? reducedMotionTransition : undefined}
          >
            <SheetHeader>
              <SheetTitle>Refund details</SheetTitle>
              <SheetDescription>
                Refund record and related transaction information.
              </SheetDescription>
            </SheetHeader>

            <dl className="flex-1 space-y-4 px-4">
              <DetailField label="Refund ID" value={refund.refundId} copyable />
              <DetailField label="Internal ID" value={refund.id} copyable />
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Amount
                </dt>
                <dd className="text-sm">
                  <CurrencyDisplay paise={refund.amountPaise} />
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </dt>
                <dd>
                  <StatusBadge
                    label={formatStatusLabel(refund.status)}
                    variant={getPaymentStatusVariant(refund.status)}
                  />
                </dd>
              </div>
              <DetailField
                label="Shopify refund"
                value={refund.shopifyRefundId ?? "—"}
                copyable={Boolean(refund.shopifyRefundId)}
              />
              <section className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Settlement impact
                </h3>
                <p className="text-sm text-muted-foreground">
                  This refund reduces the net settlement amount for the related
                  transaction batch.
                </p>
                <CurrencyDisplay
                  paise={-refund.amountPaise}
                  signed
                  className="text-sm"
                />
              </section>
              <section className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Related transaction
                </h3>
                <DetailField
                  label="Transaction ID"
                  value={refund.transactionId}
                  copyable
                />
                <DetailField label="Gateway" value="Easebuzz" />
              </section>
              <section className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Timeline
                </h3>
                <DetailField
                  label="Processed at"
                  value={
                    refund.processedAt
                      ? formatDate(refund.processedAt, "dd MMM yyyy, HH:mm")
                      : "Pending"
                  }
                />
              </section>
            </dl>

            {onRefresh ? (
              <SheetFooter className="border-t border-[var(--retro-ink)]/60 px-4 pt-4">
                <DetailSheetAction
                  label="Refresh"
                  chipClassName="bg-[var(--retro-mint)]"
                  ariaLabel="Refresh refund"
                  onClick={onRefresh}
                >
                  <RefreshCw aria-hidden="true" className="size-4" />
                </DetailSheetAction>
              </SheetFooter>
            ) : null}
          </motion.div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
