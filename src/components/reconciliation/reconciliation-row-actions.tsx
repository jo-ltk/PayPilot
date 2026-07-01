"use client";

import { Copy, Eye, MoreHorizontal, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { isResolvableStatus } from "@/lib/reconciliation-status";
import type { ReconciliationView } from "@/schemas/payments.schema";

interface ReconciliationRowActionsProps {
  record: ReconciliationView;
  canResolve: boolean;
  onViewDetails: (record: ReconciliationView) => void;
  onResolve: (record: ReconciliationView) => void;
}

function copyRecordIds(record: ReconciliationView): void {
  const ids = [
    `Record: ${record.id}`,
    record.shopifyOrderId ? `Order: ${record.shopifyOrderId}` : null,
    record.transactionId ? `Transaction: ${record.transactionId}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  void copyToClipboard(ids, "IDs");
}

/** Row action menu for reconciliation records. */
export function ReconciliationRowActions({
  record,
  canResolve,
  onViewDetails,
  onResolve,
}: ReconciliationRowActionsProps) {
  const showResolve = canResolve && isResolvableStatus(record.status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Row actions"
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <MoreHorizontal aria-hidden="true" className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem onClick={() => onViewDetails(record)}>
          <Eye aria-hidden="true" className="size-4" />
          View details
        </DropdownMenuItem>
        {showResolve ? (
          <DropdownMenuItem onClick={() => onResolve(record)}>
            <Scale aria-hidden="true" className="size-4" />
            Resolve mismatch
          </DropdownMenuItem>
        ) : null}
        {showResolve ? (
          <DropdownMenuItem onClick={() => onResolve(record)}>
            <Scale aria-hidden="true" className="size-4" />
            Mark resolved
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => copyRecordIds(record)}>
          <Copy aria-hidden="true" className="size-4" />
          Copy IDs
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
