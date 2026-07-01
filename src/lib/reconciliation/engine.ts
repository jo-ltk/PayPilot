import { MatchingStrategy, ReconciliationStatus } from "@prisma/client";

import { classifyMatch, comparisonAmount } from "@/lib/reconciliation/rules";
import {
  resolveStrategies,
  type FieldMapping,
  type GatewayFields,
  type MatchableOrder,
  type MatchStrategy,
} from "@/lib/reconciliation/strategies";
import type { SettlementStatus } from "@prisma/client";

/** Shopify order data required by the engine. */
export type EngineOrder = MatchableOrder & {
  totalPricePaise: number;
  financialStatus: string;
};

/** Gateway transaction data required by the engine. */
export type EngineTransaction = GatewayFields & {
  id: string;
  amountPaise: number;
  netAmountPaise: number;
  settlementStatus: SettlementStatus;
};

/** Aggregated gateway refund for a transaction. */
export type EngineRefund = { transactionId: string; amountPaise: number };

/** Per-shop matching configuration. */
export type EngineConfig = {
  strategy: MatchingStrategy;
  priority: string[];
  fieldMapping: FieldMapping;
  amountTolerancePaise: number;
  includeGatewayFees: boolean;
};

/** A reconciliation outcome for a single order/transaction relationship. */
export type ReconciliationResult = {
  shopifyOrderId: string | null;
  transactionId: string | null;
  status: ReconciliationStatus;
  expectedAmountPaise: number | null;
  actualAmountPaise: number | null;
  deltaPaise: number | null;
  reason: string;
};

/**
 * Builds, per strategy, an index of order-key → order for fast matching.
 * @param orders - Candidate orders
 * @param strategies - Strategies to index for
 * @returns Map of strategy name → (order key → order)
 */
function buildOrderIndexes(
  orders: EngineOrder[],
  strategies: MatchStrategy[],
): Map<string, Map<string, EngineOrder>> {
  const indexes = new Map<string, Map<string, EngineOrder>>();
  for (const strategy of strategies) {
    const index = new Map<string, EngineOrder>();
    for (const order of orders) {
      const key = strategy.orderKey(order);
      if (key) {
        index.set(key, order);
      }
    }
    indexes.set(strategy.name, index);
  }
  return indexes;
}

/**
 * Finds the order matching a transaction by trying strategies in order.
 * @param txn - Gateway transaction
 * @param strategies - Ordered strategies to attempt
 * @param indexes - Per-strategy order indexes
 * @param mapping - Field mapping config
 * @returns The matched order, or null
 */
function findMatch(
  txn: EngineTransaction,
  strategies: MatchStrategy[],
  indexes: Map<string, Map<string, EngineOrder>>,
  mapping: FieldMapping,
): EngineOrder | null {
  for (const strategy of strategies) {
    const key = strategy.transactionKey(txn, mapping);
    const match = key ? indexes.get(strategy.name)?.get(key) : undefined;
    if (match) {
      return match;
    }
  }
  return null;
}

/**
 * Sums gateway refund amounts per transaction id.
 * @param refunds - Gateway refunds
 * @returns Map of transaction id → total refunded paise
 */
function refundTotals(refunds: EngineRefund[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const refund of refunds) {
    totals.set(
      refund.transactionId,
      (totals.get(refund.transactionId) ?? 0) + refund.amountPaise,
    );
  }
  return totals;
}

/**
 * Builds the result for a matched transaction/order pair.
 * @param txn - Gateway transaction
 * @param order - Matched order
 * @param config - Matching config
 * @param gatewayRefundPaise - Total gateway refunds for the transaction
 * @returns Reconciliation result
 */
function buildMatchedResult(
  txn: EngineTransaction,
  order: EngineOrder,
  config: EngineConfig,
  gatewayRefundPaise: number,
): ReconciliationResult {
  const actual = comparisonAmount(
    txn.amountPaise,
    txn.netAmountPaise,
    config.includeGatewayFees,
  );
  const { status, reason } = classifyMatch({
    expectedAmountPaise: order.totalPricePaise,
    actualAmountPaise: actual,
    settlementStatus: txn.settlementStatus,
    orderRefunded: /refund/i.test(order.financialStatus),
    gatewayRefundPaise,
    amountTolerancePaise: config.amountTolerancePaise,
  });
  return {
    shopifyOrderId: order.id,
    transactionId: txn.id,
    status,
    expectedAmountPaise: order.totalPricePaise,
    actualAmountPaise: actual,
    deltaPaise: actual - order.totalPricePaise,
    reason,
  };
}

/**
 * Reconciles orders against gateway transactions and refunds.
 *
 * Pure function (no I/O) so it can be exhaustively unit tested. Produces one
 * result per transaction plus one per unmatched order (MISSING_GATEWAY).
 * @param input - Orders, transactions, refunds, and matching config
 * @returns Reconciliation results
 */
export function reconcile(input: {
  orders: EngineOrder[];
  transactions: EngineTransaction[];
  refunds: EngineRefund[];
  config: EngineConfig;
}): ReconciliationResult[] {
  const strategies = resolveStrategies(input.config.strategy, input.config.priority);
  const indexes = buildOrderIndexes(input.orders, strategies);
  const totals = refundTotals(input.refunds);
  const matchedOrderIds = new Set<string>();
  const results: ReconciliationResult[] = [];

  for (const txn of input.transactions) {
    const order = findMatch(txn, strategies, indexes, input.config.fieldMapping);
    if (!order) {
      results.push({
        shopifyOrderId: null,
        transactionId: txn.id,
        status: ReconciliationStatus.MISSING_SHOPIFY,
        expectedAmountPaise: null,
        actualAmountPaise: txn.amountPaise,
        deltaPaise: null,
        reason: "Gateway transaction with no matching Shopify order",
      });
      continue;
    }
    matchedOrderIds.add(order.id);
    results.push(
      buildMatchedResult(txn, order, input.config, totals.get(txn.id) ?? 0),
    );
  }

  for (const order of input.orders) {
    if (!matchedOrderIds.has(order.id)) {
      results.push({
        shopifyOrderId: order.id,
        transactionId: null,
        status: ReconciliationStatus.MISSING_GATEWAY,
        expectedAmountPaise: order.totalPricePaise,
        actualAmountPaise: null,
        deltaPaise: null,
        reason: "Shopify order with no matching gateway transaction",
      });
    }
  }

  return results;
}
