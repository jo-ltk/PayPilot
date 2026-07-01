import type { ReconciliationView } from "@/schemas/payments.schema";

function matchesDateRange(
  createdAt: string,
  from?: string,
  to?: string,
): boolean {
  const timestamp = new Date(createdAt).getTime();

  if (from && timestamp < new Date(from).getTime()) {
    return false;
  }

  if (to && timestamp > new Date(to).getTime()) {
    return false;
  }

  return true;
}

/**
 * Client-side search and date filtering for reconciliation rows.
 * @param rows - API reconciliation rows
 * @param search - Search query
 * @param from - Optional start date (ISO)
 * @param to - Optional end date (ISO)
 * @returns Filtered rows
 */
export function filterReconciliationRows(
  rows: ReconciliationView[],
  search?: string,
  from?: string,
  to?: string,
): ReconciliationView[] {
  const query = search?.trim().toLowerCase();

  return rows.filter((row) => {
    if (!matchesDateRange(row.createdAt, from, to)) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [row.id, row.shopifyOrderId, row.transactionId, row.reason]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
}

/**
 * Derives a settlement column label from reconciliation status.
 * @param status - Reconciliation status
 * @returns Settlement display label
 */
export function getSettlementColumnLabel(
  status: ReconciliationView["status"],
): string {
  if (status === "PENDING_SETTLEMENT") {
    return "Pending";
  }

  if (status === "MATCHED" || status === "RESOLVED") {
    return "Settled";
  }

  return "—";
}
