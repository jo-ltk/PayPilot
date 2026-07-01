"use client";

import Link from "next/link";
import { Download, RefreshCw } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

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
import type { SettlementView } from "@/schemas/payments.schema";

interface SettlementDetailSheetProps {
  settlement: SettlementView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AppMode;
  shopId: string | null;
  onRefresh?: () => void;
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
            <SheetFooter className="flex-row flex-wrap gap-2">
              {onRefresh ? (
                <Button type="button" variant="outline" onClick={onRefresh}>
                  <RefreshCw aria-hidden="true" className="size-4" />
                  Refresh
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                onClick={() => exportSettlementRow(settlement)}
              >
                <Download aria-hidden="true" className="size-4" />
                Export CSV
              </Button>
              <Link href={reconciliationHref}>
                <Button type="button" variant="outline">
                  View reconciliation
                </Button>
              </Link>
            </SheetFooter>
          </motion.div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
