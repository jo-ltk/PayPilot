import {
  ReconciliationStatus,
  SettlementStatus,
  WebhookSource,
  WebhookStatus,
} from "@prisma/client";
import { subDays } from "date-fns";

import type { Rng } from "./seed-rng";

/** Anchor date so seeded data always falls inside the default 30-day dashboard window. */
export const SEED_REFERENCE_DATE = new Date("2026-07-03T12:00:00.000Z");

/** Default number of transactions when SEED_VOLUME is unset. */
export const DEFAULT_SEED_VOLUME = 500;

/** Days of history to generate. */
export const SEED_RANGE_DAYS = 90;

export const PAYMENT_MODES = ["UPI", "CC", "DC", "NB", "WALLET", "EMI"] as const;
export const FIRST_NAMES = [
  "Priya", "Rahul", "Ananya", "Vikram", "Sneha", "Arjun", "Kavya", "Rohan",
  "Meera", "Aditya", "Isha", "Karan", "Divya", "Nikhil", "Pooja", "Sanjay",
];
export const LAST_NAMES = [
  "Sharma", "Patel", "Reddy", "Iyer", "Gupta", "Singh", "Nair", "Mehta",
  "Joshi", "Khan", "Das", "Rao", "Verma", "Malhotra", "Chopra", "Bose",
];
export const BANK_LAST4 = [
  "4321", "7890", "2468", "1357", "8642", "9753", "3210", "6543",
];

export type TxnStatus =
  | "success"
  | "failure"
  | "pending"
  | "userCancelled"
  | "initiated"
  | "processing"
  | "chargeback"
  | "disputed";

export type OrderRow = {
  id: string;
  shopId: string;
  shopifyOrderId: string;
  orderName: string;
  orderNumber: number;
  totalPricePaise: number;
  currency: string;
  financialStatus: string;
  paymentGatewayNames: string[];
  shopifyPaymentId: string | null;
  processedAt: Date | null;
  rawPayload: { id: string; name: string };
};

export type TransactionRow = {
  id: string;
  shopId: string;
  gatewayId: string;
  easebuzzTxnId: string;
  easebuzzPaymentId: string | null;
  amountPaise: number;
  feesPaise: number;
  netAmountPaise: number;
  currency: string;
  status: string;
  mode: string | null;
  email: string | null;
  phone: string | null;
  txnid: string | null;
  udf1: string | null;
  matchedOrderId: string | null;
  settlementStatus: SettlementStatus;
  occurredAt: Date;
  rawPayload: { txnid: string; status: string };
};

export type SettlementRow = {
  id: string;
  shopId: string;
  gatewayId: string;
  payoutId: string;
  payoutDate: Date;
  totalAmountPaise: number;
  transactionCount: number;
  status: string;
  utrNumber: string | null;
  bankAccountLast4: string | null;
  rawPayload: { payout_id: string };
};

export type LineItemRow = {
  id: string;
  settlementId: string;
  transactionId: string;
  grossPaise: number;
  feesPaise: number;
  netPaise: number;
};

export type RefundRow = {
  id: string;
  shopId: string;
  transactionId: string;
  refundId: string;
  amountPaise: number;
  status: string;
  shopifyRefundId: string | null;
  processedAt: Date | null;
  rawPayload: { refund_id: string };
};

export type ReconciliationRow = {
  id: string;
  shopId: string;
  shopifyOrderId: string | null;
  transactionId: string | null;
  status: ReconciliationStatus;
  expectedAmountPaise: number | null;
  actualAmountPaise: number | null;
  deltaPaise: number | null;
  reason: string | null;
  resolvedAt: Date | null;
  resolvedByUserId: string | null;
  createdAt: Date;
};

export type WebhookRow = {
  id: string;
  source: WebhookSource;
  eventType: string;
  idempotencyKey: string;
  shopId: string;
  payload: Record<string, string>;
  status: WebhookStatus;
  processedAt: Date | null;
};

export type GeneratedCommerce = {
  orders: OrderRow[];
  transactions: TransactionRow[];
  settlements: SettlementRow[];
  lineItems: LineItemRow[];
  refunds: RefundRow[];
  reconciliations: ReconciliationRow[];
  webhookEvents: WebhookRow[];
};

/**
 * Reads SEED_VOLUME from the environment with a safe default.
 * @returns Transaction count for the demo dataset
 */
export function getSeedVolume(): number {
  const raw = process.env.SEED_VOLUME;
  if (!raw) {
    return DEFAULT_SEED_VOLUME;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 50) {
    return DEFAULT_SEED_VOLUME;
  }
  return Math.min(parsed, 2000);
}

/**
 * Picks a random timestamp within the seed range, capped at the reference date.
 * @param rng - Seeded random generator
 * @param daysBack - Maximum days before the reference date
 * @returns Transaction timestamp
 */
export function randomDate(rng: Rng, daysBack: number): Date {
  const dayOffset = rng.int(0, daysBack);
  const hour = rng.int(8, 22);
  const minute = rng.int(0, 59);
  const base = subDays(SEED_REFERENCE_DATE, dayOffset);
  base.setUTCHours(hour, minute, 0, 0);
  if (base.getTime() > SEED_REFERENCE_DATE.getTime()) {
    return new Date(SEED_REFERENCE_DATE);
  }
  return base;
}

/** Computes gateway fees for a gross amount in paise. */
export function computeFees(amountPaise: number): number {
  return Math.round(amountPaise * 0.015) + 200;
}

/** Picks a realistic transaction amount tier. */
export function randomAmount(rng: Rng): number {
  const tier = rng.pickWeighted([
    { value: "small" as const, weight: 60 },
    { value: "medium" as const, weight: 30 },
    { value: "high" as const, weight: 10 },
  ]);
  if (tier === "small") {
    return rng.int(50000, 500000);
  }
  if (tier === "medium") {
    return rng.int(500000, 5000000);
  }
  return rng.int(5000000, 50000000);
}

/** Picks a weighted payment status for variety. */
export function pickTxnStatus(rng: Rng): TxnStatus {
  return rng.pickWeighted([
    { value: "success", weight: 72 },
    { value: "failure", weight: 8 },
    { value: "pending", weight: 5 },
    { value: "userCancelled", weight: 4 },
    { value: "initiated", weight: 4 },
    { value: "processing", weight: 3 },
    { value: "chargeback", weight: 2 },
    { value: "disputed", weight: 2 },
  ]);
}

/** Generates a demo customer email. */
export function customerEmail(rng: Rng, index: number): string {
  const first = rng.pick(FIRST_NAMES).toLowerCase();
  const last = rng.pick(LAST_NAMES).toLowerCase();
  return `${first}.${last}${index % 97}@customer-demo.test`;
}

/** Generates a demo Indian mobile number. */
export function customerPhone(rng: Rng): string {
  const prefix = rng.pick([
    "90", "91", "92", "93", "94", "95", "96", "97", "98", "99",
  ]);
  return `${prefix}${String(rng.int(10000000, 99999999))}`;
}

/** Returns the ISO week key for grouping settlements. */
export function weekKey(date: Date): string {
  const start = new Date(date);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  return start.toISOString().slice(0, 10);
}
