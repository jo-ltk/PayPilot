"use client";

import { CurrencyDisplay } from "@/components/shared/currency-display";
import type { ReconciliationView } from "@/schemas/payments.schema";

interface ReconciliationAmountComparisonProps {
  record: ReconciliationView;
}

/** Side-by-side expected vs actual amount comparison. */
export function ReconciliationAmountComparison({
  record,
}: ReconciliationAmountComparisonProps) {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-lg border border-border p-3">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Expected
        </p>
        {record.expectedAmountPaise != null ? (
          <CurrencyDisplay paise={record.expectedAmountPaise} />
        ) : (
          <span className="text-sm">—</span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Actual
        </p>
        {record.actualAmountPaise != null ? (
          <CurrencyDisplay paise={record.actualAmountPaise} />
        ) : (
          <span className="text-sm">—</span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Difference
        </p>
        {record.deltaPaise != null ? (
          <CurrencyDisplay paise={record.deltaPaise} signed />
        ) : (
          <span className="text-sm">—</span>
        )}
      </div>
    </div>
  );
}
