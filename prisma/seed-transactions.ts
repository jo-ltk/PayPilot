import { SettlementStatus, WebhookSource, WebhookStatus } from "@prisma/client";

import type { Rng } from "./seed-rng";
import {
  computeFees,
  customerEmail,
  customerPhone,
  PAYMENT_MODES,
  pickTxnStatus,
  randomAmount,
  randomDate,
  SEED_RANGE_DAYS,
  SEED_REFERENCE_DATE,
  weekKey,
  type GeneratedCommerce,
  type OrderRow,
  type TransactionRow,
} from "./seed-types";
import { buildDerivedRecords } from "./seed-derived";

/** Builds a Shopify order row linked to a transaction. */
export function buildOrder(
  shopId: string,
  index: number,
  amountPaise: number,
  occurredAt: Date,
): OrderRow {
  const orderNumber = 1000 + index;
  const shopifyOrderId = String(6543210000 + index);
  return {
    id: `seed_order_${index}`,
    shopId,
    shopifyOrderId,
    orderName: `#${orderNumber}`,
    orderNumber,
    totalPricePaise: amountPaise,
    currency: "INR",
    financialStatus: "paid",
    paymentGatewayNames: ["Easebuzz"],
    shopifyPaymentId: `gid://shopify/PaymentTransaction/${orderNumber}`,
    processedAt: occurredAt,
    rawPayload: { id: shopifyOrderId, name: `#${orderNumber}` },
  };
}

/** Builds a gateway transaction with optional field overrides. */
export function buildTransaction(
  shopId: string,
  gatewayId: string,
  index: number,
  rng: Rng,
  overrides?: Partial<TransactionRow>,
): TransactionRow {
  const amountPaise = overrides?.amountPaise ?? randomAmount(rng);
  const feesPaise = overrides?.feesPaise ?? computeFees(amountPaise);
  const status = overrides?.status ?? pickTxnStatus(rng);
  const occurredAt = overrides?.occurredAt ?? randomDate(rng, SEED_RANGE_DAYS);
  const isSuccess =
    status === "success" || status === "chargeback" || status === "disputed";
  const settlementStatus = !isSuccess
    ? SettlementStatus.UNSETTLED
    : overrides?.settlementStatus ??
      (rng.bool(0.18) ? SettlementStatus.PENDING : SettlementStatus.SETTLED);

  return {
    id: `seed_txn_${index}`,
    shopId,
    gatewayId,
    easebuzzTxnId: `EZTXN${String(index).padStart(5, "0")}`,
    easebuzzPaymentId: `EZPAY${String(index).padStart(5, "0")}`,
    amountPaise,
    feesPaise,
    netAmountPaise: amountPaise - feesPaise,
    currency: "INR",
    status,
    mode: rng.pick(PAYMENT_MODES),
    email: customerEmail(rng, index),
    phone: customerPhone(rng),
    txnid: `#${1000 + index}`,
    udf1: String(6543210000 + index),
    matchedOrderId: overrides?.matchedOrderId ?? null,
    settlementStatus,
    occurredAt,
    rawPayload: { txnid: `EZTXN${index}`, status },
    ...overrides,
  };
}

function addDuplicatePayments(
  transactions: TransactionRow[],
  shopId: string,
  gatewayId: string,
  volume: number,
  rng: Rng,
): void {
  const successes = transactions.filter(
    (t) => t.status === "success" && t.matchedOrderId,
  );
  for (let d = 0; d < 5 && successes.length > 0; d++) {
    const source = rng.pick(successes);
    const dupIndex = volume + d + 1;
    transactions.push(
      buildTransaction(shopId, gatewayId, dupIndex, rng, {
        amountPaise: source.amountPaise,
        status: "success",
        matchedOrderId: source.matchedOrderId,
        txnid: source.txnid,
        udf1: source.udf1,
        occurredAt: new Date(
          Math.min(
            source.occurredAt.getTime() + 3600000,
            SEED_REFERENCE_DATE.getTime(),
          ),
        ),
        settlementStatus: SettlementStatus.PENDING,
      }),
    );
  }
}

function addOrphanOrders(
  orders: OrderRow[],
  shopId: string,
  volume: number,
  rng: Rng,
): void {
  for (let m = 0; m < 8; m++) {
    const idx = volume + 100 + m;
    orders.push(
      buildOrder(shopId, idx, randomAmount(rng), randomDate(rng, SEED_RANGE_DAYS)),
    );
  }
}

function addOrphanTransactions(
  transactions: TransactionRow[],
  shopId: string,
  gatewayId: string,
  volume: number,
  rng: Rng,
): void {
  for (let m = 0; m < 6; m++) {
    const idx = volume + 200 + m;
    transactions.push(
      buildTransaction(shopId, gatewayId, idx, rng, {
        status: "success",
        matchedOrderId: null,
        settlementStatus: SettlementStatus.UNSETTLED,
      }),
    );
  }
}

/**
 * Generates orders, transactions, settlements, refunds, and reconciliation rows.
 * @param shopId - Demo shop id
 * @param gatewayId - Demo gateway id
 * @param userId - Demo owner user id (for resolved reconciliation)
 * @param volume - Number of transactions to generate
 * @param rng - Seeded random generator
 * @returns Linked commerce records
 */
export function generateCommerceData(
  shopId: string,
  gatewayId: string,
  userId: string,
  volume: number,
  rng: Rng,
): GeneratedCommerce {
  const orders: OrderRow[] = [];
  const transactions: TransactionRow[] = [];
  const settledByWeek = new Map<string, TransactionRow[]>();
  const webhookEvents: GeneratedCommerce["webhookEvents"] = [];

  for (let i = 1; i <= volume; i++) {
    const txn = buildTransaction(shopId, gatewayId, i, rng);
    const isSuccess =
      txn.status === "success" ||
      txn.status === "chargeback" ||
      txn.status === "disputed";

    if (isSuccess && rng.bool(0.92)) {
      const order = buildOrder(shopId, i, txn.amountPaise, txn.occurredAt);
      orders.push(order);
      txn.matchedOrderId = order.id;
      txn.txnid = order.orderName;
      txn.udf1 = order.shopifyOrderId;
    }

    transactions.push(txn);

    if (txn.settlementStatus === SettlementStatus.SETTLED) {
      const key = weekKey(txn.occurredAt);
      const bucket = settledByWeek.get(key) ?? [];
      bucket.push(txn);
      settledByWeek.set(key, bucket);
    }

    webhookEvents.push({
      id: `seed_webhook_txn_${i}`,
      source: WebhookSource.EASEBUZZ,
      eventType: "transaction",
      idempotencyKey: `easebuzz:txn:${txn.easebuzzTxnId}:${txn.status}`,
      shopId,
      payload: { txnid: txn.easebuzzTxnId, status: txn.status },
      status: WebhookStatus.PROCESSED,
      processedAt: txn.occurredAt,
    });
  }

  addDuplicatePayments(transactions, shopId, gatewayId, volume, rng);
  addOrphanOrders(orders, shopId, volume, rng);
  addOrphanTransactions(transactions, shopId, gatewayId, volume, rng);

  return buildDerivedRecords(
    shopId,
    gatewayId,
    userId,
    orders,
    transactions,
    settledByWeek,
    webhookEvents,
    rng,
  );
}
