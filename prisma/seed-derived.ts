import { WebhookSource, WebhookStatus } from "@prisma/client";
import { subDays } from "date-fns";

import type { Rng } from "./seed-rng";
import { buildReconciliations } from "./seed-reconciliation";
import {
  BANK_LAST4,
  SEED_REFERENCE_DATE,
  type GeneratedCommerce,
  type LineItemRow,
  type OrderRow,
  type ReconciliationRow,
  type RefundRow,
  type SettlementRow,
  type TransactionRow,
  type WebhookRow,
} from "./seed-types";

/**
 * Builds settlements, refunds, and reconciliation from generated transactions.
 * @param shopId - Demo shop id
 * @param gatewayId - Demo gateway id
 * @param userId - Demo owner user id
 * @param orders - Generated Shopify orders
 * @param transactions - Generated gateway transactions
 * @param settledByWeek - Settled transactions grouped by week
 * @param webhookEvents - Webhook events collected so far
 * @param rng - Seeded random generator
 * @returns Derived commerce records
 */
export function buildDerivedRecords(
  shopId: string,
  gatewayId: string,
  userId: string,
  orders: OrderRow[],
  transactions: TransactionRow[],
  settledByWeek: Map<string, TransactionRow[]>,
  webhookEvents: WebhookRow[],
  rng: Rng,
): GeneratedCommerce {
  const refunds: RefundRow[] = [];
  const reconciliations: ReconciliationRow[] = [];
  const { settlements, lineItems } = buildSettlements(
    shopId,
    gatewayId,
    settledByWeek,
    rng,
  );
  buildRefunds(shopId, transactions, refunds, webhookEvents, rng);
  buildReconciliations(
    shopId,
    userId,
    orders,
    transactions,
    refunds,
    reconciliations,
    rng,
  );

  return {
    orders,
    transactions,
    settlements,
    lineItems,
    refunds,
    reconciliations,
    webhookEvents,
  };
}

function buildSettlements(
  shopId: string,
  gatewayId: string,
  settledByWeek: Map<string, TransactionRow[]>,
  rng: Rng,
): { settlements: SettlementRow[]; lineItems: LineItemRow[] } {
  const settlements: SettlementRow[] = [];
  const lineItems: LineItemRow[] = [];
  let settlementIndex = 1;
  let lineIndex = 1;
  const weeks = [...settledByWeek.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );

  for (const [weekIndex, [week, txns]] of weeks.entries()) {
    const payoutDate = new Date(`${week}T06:00:00.000Z`);
    payoutDate.setUTCDate(payoutDate.getUTCDate() + 3);
    const isRecent = payoutDate > subDays(SEED_REFERENCE_DATE, 5);
    const isLast = weekIndex === weeks.length - 1;
    const status = isLast
      ? "pending"
      : isRecent
        ? rng.bool(0.4)
          ? "pending"
          : "completed"
        : settlementIndex % 17 === 0
          ? "failed"
          : "completed";

    let totalNet = 0;
    const settlementId = `seed_settlement_${settlementIndex}`;
    for (const txn of txns) {
      lineItems.push({
        id: `seed_lineitem_${lineIndex}`,
        settlementId,
        transactionId: txn.id,
        grossPaise: txn.amountPaise,
        feesPaise: txn.feesPaise,
        netPaise: txn.netAmountPaise,
      });
      totalNet += txn.netAmountPaise;
      lineIndex += 1;
    }

    settlements.push({
      id: settlementId,
      shopId,
      gatewayId,
      payoutId: `PAYOUT${week.replace(/-/g, "")}`,
      payoutDate,
      totalAmountPaise: totalNet,
      transactionCount: txns.length,
      status,
      utrNumber:
        status === "completed"
          ? `UTR${week.replace(/-/g, "")}${settlementIndex}`
          : null,
      bankAccountLast4: rng.pick(BANK_LAST4),
      rawPayload: { payout_id: `PAYOUT${week.replace(/-/g, "")}` },
    });
    settlementIndex += 1;
  }

  return { settlements, lineItems };
}

function buildRefunds(
  shopId: string,
  transactions: TransactionRow[],
  refunds: RefundRow[],
  webhookEvents: WebhookRow[],
  rng: Rng,
): void {
  const eligible = transactions.filter(
    (t) =>
      t.status === "success" ||
      t.status === "chargeback" ||
      t.status === "disputed",
  );
  let refundIndex = 1;

  for (const txn of eligible) {
    if (!rng.bool(0.16)) {
      continue;
    }

    const isFull = rng.bool(0.55);
    const amountPaise = isFull
      ? txn.amountPaise
      : Math.round((txn.amountPaise * rng.int(30, 70)) / 100);
    const status = rng.pickWeighted([
      { value: "processed", weight: 78 },
      { value: "pending", weight: 14 },
      { value: "failed", weight: 8 },
    ]);
    const processedAt =
      status === "processed"
        ? new Date(txn.occurredAt.getTime() + rng.int(1, 14) * 86400000)
        : null;

    refunds.push({
      id: `seed_refund_${refundIndex}`,
      shopId,
      transactionId: txn.id,
      refundId: `EZREFUND${String(refundIndex).padStart(5, "0")}`,
      amountPaise,
      status,
      shopifyRefundId:
        status === "processed"
          ? `gid://shopify/Refund/${refundIndex}`
          : null,
      processedAt,
      rawPayload: { refund_id: `EZREFUND${refundIndex}` },
    });

    webhookEvents.push({
      id: `seed_webhook_refund_${refundIndex}`,
      source: WebhookSource.EASEBUZZ,
      eventType: "refund",
      idempotencyKey: `easebuzz:refund:EZREFUND${refundIndex}:${status}`,
      shopId,
      payload: { refund_id: `EZREFUND${refundIndex}`, status },
      status: WebhookStatus.PROCESSED,
      processedAt,
    });
    refundIndex += 1;
  }
}
