"use client";

import Link from "next/link";
import { Download, RefreshCw, Scale } from "lucide-react";
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
import type { AppMode } from "@/hooks/use-shop-context";
import { drawerContentVariants, reducedMotionTransition } from "@/lib/animations";
import { buildCsv, downloadCsv } from "@/lib/export-csv";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { buildShopBasePath } from "@/lib/navigation";
import {
  formatStatusLabel,
  getSettlementStatusVariant,
} from "@/lib/payment-status";
import { cn } from "@/lib/utils";
import type { SettlementView } from "@/schemas/payments.schema";

interface SettlementDetailSheetProps {
  settlement: SettlementView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AppMode;
  shopId: string | null;
  onRefresh?: () => void;
}

interface DetailSheetActionProps {
  label: string;
  chipClassName: string;
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

function DetailSheetAction({
  label,
  chipClassName,
  children,
  onClick,
  href,
  disabled,
  ariaLabel,
}: DetailSheetActionProps) {
  const button = (
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

  if (href) {
    return (
      <Link href={href} className="block w-full min-w-0">
        {button}
      </Link>
    );
  }

  return button;
}

function exportSettlementRow(settlement: SettlementView): void {
  const csv = buildCsv([settlement], [
    { header: "Settlement ID", value: (row) => row.payoutId },
    { header: "Payout Date", value: (row) => formatDate(row.payoutDate) },
    { header: "Gross Amount", value: (row) => formatCurrency(row.totalAmountPaise) },
    { header: "Transactions", value: (row) => String(row.transactionCount) },
    { header: "Status", value: (row) => row.status },
    { header: "UTR", value: (row) => row.utrNumber },
  ]);

  downloadCsv(`settlement-${settlement.payoutId}.csv`, csv);
}

/** Side drawer showing full settlement batch details. */
export function SettlementDetailSheet({
  settlement,
  open,
  onOpenChange,
  mode,
  shopId,
  onRefresh,
}: SettlementDetailSheetProps) {
  const prefersReducedMotion = useReducedMotion();
  const reconciliationHref = `${buildShopBasePath(mode, shopId)}/reconciliation`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {settlement ? (
          <motion.div
            className="flex h-full flex-col"
            variants={drawerContentVariants}
            initial="hidden"
            animate="visible"
            transition={prefersReducedMotion ? reducedMotionTransition : undefined}
          >
            <SheetHeader>
              <SheetTitle>Settlement details</SheetTitle>
              <SheetDescription>
                Payout batch summary from the gateway.
              </SheetDescription>
            </SheetHeader>
            <dl className="flex-1 space-y-4 px-4">
              <DetailField label="Settlement ID" value={settlement.id} copyable />
              <DetailField
                label="Payout ID"
                value={settlement.payoutId}
                copyable
              />
              <DetailField
                label="Payout date"
                value={formatDate(settlement.payoutDate)}
              />
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Gross amount
                </dt>
                <dd className="text-sm">
                  <CurrencyDisplay paise={settlement.totalAmountPaise} />
                </dd>
              </div>
              <DetailField
                label="Transactions"
                value={formatNumber(settlement.transactionCount)}
              />
              <DetailField
                label="UTR number"
                value={settlement.utrNumber ?? "—"}
                copyable={Boolean(settlement.utrNumber)}
              />
              <DetailField
                label="Bank account"
                value={
                  settlement.bankAccountLast4
                    ? `•••• ${settlement.bankAccountLast4}`
                    : "—"
                }
              />
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </dt>
                <dd>
                  <StatusBadge
                    label={formatStatusLabel(settlement.status)}
                    variant={getSettlementStatusVariant(settlement.status)}
                  />
                </dd>
              </div>
            </dl>
            <SheetFooter className="border-t border-[var(--retro-ink)]/60 px-4 pt-4">
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
                {onRefresh ? (
                  <DetailSheetAction
                    label="Refresh"
                    chipClassName="bg-[var(--retro-mint)]"
                    ariaLabel="Refresh settlement"
                    onClick={onRefresh}
                  >
                    <RefreshCw aria-hidden="true" className="size-4" />
                  </DetailSheetAction>
                ) : null}
                <DetailSheetAction
                  label="Export CSV"
                  chipClassName="bg-[var(--retro-pink)]"
                  onClick={() => exportSettlementRow(settlement)}
                >
                  <Download aria-hidden="true" className="size-4" />
                </DetailSheetAction>
                <DetailSheetAction
                  label="Reconcile"
                  chipClassName="bg-[var(--retro-blue)]"
                  href={reconciliationHref}
                >
                  <Scale aria-hidden="true" className="size-4" />
                </DetailSheetAction>
              </div>
            </SheetFooter>
          </motion.div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
