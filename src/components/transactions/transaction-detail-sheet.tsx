"use client";

import Link from "next/link";
import { Download, RefreshCw, Scale } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { DetailField } from "@/components/shared/detail-field";
import { CurrencyDisplay } from "@/components/shared/currency-display";
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
import { buildCsv, downloadCsv } from "@/lib/export-csv";
import { formatCurrency, formatDate } from "@/lib/format";
import { buildShopBasePath } from "@/lib/navigation";
import {
  formatStatusLabel,
  getPaymentStatusVariant,
} from "@/lib/payment-status";
import { cn } from "@/lib/utils";
import type { TransactionView } from "@/schemas/payments.schema";
import type { AppMode } from "@/hooks/use-shop-context";

interface TransactionDetailSheetProps {
  transaction: TransactionView | null;
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

function exportTransactionRow(transaction: TransactionView): void {
  const csv = buildCsv([transaction], [
    { header: "Transaction ID", value: (row) => row.id },
    { header: "Gateway Reference", value: (row) => row.easebuzzPaymentId },
    { header: "Easebuzz Txn ID", value: (row) => row.easebuzzTxnId },
    { header: "Order", value: (row) => row.txnid ?? row.matchedOrderId },
    { header: "Amount", value: (row) => formatCurrency(row.amountPaise, row.currency) },
    { header: "Status", value: (row) => row.status },
    {
      header: "Created At",
      value: (row) => formatDate(row.occurredAt, "yyyy-MM-dd HH:mm:ss"),
    },
  ]);

  downloadCsv(`transaction-${transaction.easebuzzTxnId}.csv`, csv);
}

/** Side drawer showing full transaction details and actions. */
export function TransactionDetailSheet({
  transaction,
  open,
  onOpenChange,
  mode,
  shopId,
  onRefresh,
}: TransactionDetailSheetProps) {
  const prefersReducedMotion = useReducedMotion();
  const reconciliationHref = `${buildShopBasePath(mode, shopId)}/reconciliation`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {transaction ? (
          <motion.div
            className="flex h-full flex-col"
            variants={drawerContentVariants}
            initial="hidden"
            animate="visible"
            transition={prefersReducedMotion ? reducedMotionTransition : undefined}
          >
            <SheetHeader>
              <SheetTitle>Transaction details</SheetTitle>
              <SheetDescription>
                Complete payment record from the gateway.
              </SheetDescription>
            </SheetHeader>
            <dl className="flex-1 space-y-4 px-4">
              <DetailField label="Transaction ID" value={transaction.id} copyable />
              <DetailField
                label="Gateway reference"
                value={transaction.easebuzzPaymentId ?? transaction.easebuzzTxnId}
                copyable
              />
              <DetailField
                label="Easebuzz txn ID"
                value={transaction.easebuzzTxnId}
                copyable
              />
              <DetailField
                label="Order"
                value={transaction.txnid ?? transaction.matchedOrderId ?? "—"}
                copyable={Boolean(transaction.txnid ?? transaction.matchedOrderId)}
              />
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Amount
                </dt>
                <dd className="text-sm">
                  <CurrencyDisplay
                    paise={transaction.amountPaise}
                    currency={transaction.currency}
                  />
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Fees
                </dt>
                <dd className="text-sm">
                  <CurrencyDisplay
                    paise={transaction.feesPaise}
                    currency={transaction.currency}
                  />
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Net amount
                </dt>
                <dd className="text-sm">
                  <CurrencyDisplay
                    paise={transaction.netAmountPaise}
                    currency={transaction.currency}
                  />
                </dd>
              </div>
              <DetailField label="Mode" value={transaction.mode ?? "—"} />
              <DetailField label="Email" value={transaction.email ?? "—"} copyable />
              <DetailField label="Phone" value={transaction.phone ?? "—"} />
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Status
                </dt>
                <dd>
                  <StatusBadge
                    label={formatStatusLabel(transaction.status)}
                    variant={getPaymentStatusVariant(transaction.status)}
                  />
                </dd>
              </div>
              <DetailField
                label="Settlement status"
                value={formatStatusLabel(transaction.settlementStatus)}
              />
              <DetailField
                label="Created at"
                value={formatDate(transaction.occurredAt, "dd MMM yyyy, HH:mm:ss")}
              />
            </dl>
            <SheetFooter className="border-t border-[var(--retro-ink)]/60 px-4 pt-4">
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3">
                {onRefresh ? (
                  <DetailSheetAction
                    label="Refresh"
                    chipClassName="bg-[var(--retro-mint)]"
                    ariaLabel="Refresh transaction"
                    onClick={onRefresh}
                  >
                    <RefreshCw aria-hidden="true" className="size-4" />
                  </DetailSheetAction>
                ) : null}
                <DetailSheetAction
                  label="Export CSV"
                  chipClassName="bg-[var(--retro-pink)]"
                  onClick={() => exportTransactionRow(transaction)}
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
