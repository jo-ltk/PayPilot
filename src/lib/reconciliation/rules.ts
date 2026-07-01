import { ReconciliationStatus, SettlementStatus } from "@prisma/client";

/** A matched order/transaction pair evaluated by the rules. */
export type ReconciliationInputs = {
  expectedAmountPaise: number;
  actualAmountPaise: number;
  settlementStatus: SettlementStatus;
  orderRefunded: boolean;
  gatewayRefundPaise: number;
  amountTolerancePaise: number;
};

/** Outcome of classifying a matched pair. */
export type Classification = {
  status: ReconciliationStatus;
  reason: string;
};

/**
 * Selects the amount to compare against the order total.
 * @param amountPaise - Gross transaction amount in paise
 * @param netAmountPaise - Net (post-fee) amount in paise
 * @param includeGatewayFees - Whether to compare net of gateway fees
 * @returns The comparison amount in paise
 */
export function comparisonAmount(
  amountPaise: number,
  netAmountPaise: number,
  includeGatewayFees: boolean,
): number {
  return includeGatewayFees ? netAmountPaise : amountPaise;
}

/**
 * Determines whether two paise amounts match within a tolerance.
 * @param expected - Expected amount in paise
 * @param actual - Actual amount in paise
 * @param tolerancePaise - Maximum allowed absolute delta
 * @returns Whether the amounts are considered equal
 */
export function amountsMatch(
  expected: number,
  actual: number,
  tolerancePaise: number,
): boolean {
  return Math.abs(actual - expected) <= tolerancePaise;
}

/**
 * Classifies a matched order/transaction pair into a reconciliation status.
 *
 * Precedence: amount mismatch → refund mismatch → pending settlement → matched.
 * @param inputs - Amounts, settlement state, and refund signals
 * @returns The resolved status and a human-readable reason
 */
export function classifyMatch(inputs: ReconciliationInputs): Classification {
  const delta = inputs.actualAmountPaise - inputs.expectedAmountPaise;

  if (!amountsMatch(inputs.expectedAmountPaise, inputs.actualAmountPaise, inputs.amountTolerancePaise)) {
    return {
      status: ReconciliationStatus.AMOUNT_MISMATCH,
      reason: `Amount delta ${delta} paise exceeds tolerance ${inputs.amountTolerancePaise}`,
    };
  }

  const hasGatewayRefund = inputs.gatewayRefundPaise > 0;
  if (inputs.orderRefunded !== hasGatewayRefund) {
    return {
      status: ReconciliationStatus.REFUND_MISMATCH,
      reason: inputs.orderRefunded
        ? "Shopify order refunded but no gateway refund recorded"
        : "Gateway refund recorded but Shopify order not refunded",
    };
  }

  if (inputs.settlementStatus !== SettlementStatus.SETTLED) {
    return {
      status: ReconciliationStatus.PENDING_SETTLEMENT,
      reason: "Matched; awaiting settlement",
    };
  }

  return { status: ReconciliationStatus.MATCHED, reason: "Matched and settled" };
}
