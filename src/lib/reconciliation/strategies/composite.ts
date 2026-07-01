import { MatchingStrategy } from "@prisma/client";

import type { MatchStrategy } from "@/lib/reconciliation/strategies";
import { shopifyPaymentIdStrategy } from "./shopify-payment-id";
import { txnidOrderNameStrategy } from "./txnid-order-name";
import { udfOrderIdStrategy } from "./udf-order-id";
import { udfOrderNameStrategy } from "./udf-order-name";

/** Lookup of single strategies by their enum/name. */
export const STRATEGY_BY_NAME: Record<string, MatchStrategy> = {
  [MatchingStrategy.UDF_ORDER_ID]: udfOrderIdStrategy,
  [MatchingStrategy.UDF_ORDER_NAME]: udfOrderNameStrategy,
  [MatchingStrategy.TXNID_ORDER_NAME]: txnidOrderNameStrategy,
  [MatchingStrategy.SHOPIFY_PAYMENT_ID]: shopifyPaymentIdStrategy,
};

/**
 * Resolves the ordered list of strategies to apply for a shop's config.
 *
 * For `COMPOSITE`, the `priority` list is followed in order; the first matching
 * strategy wins. For a single strategy, a one-element list is returned.
 * @param strategy - Configured matching strategy
 * @param priority - Ordered strategy names for COMPOSITE
 * @returns Strategies to attempt, in order
 */
export function resolveStrategies(
  strategy: MatchingStrategy,
  priority: string[],
): MatchStrategy[] {
  if (strategy !== MatchingStrategy.COMPOSITE) {
    const single = STRATEGY_BY_NAME[strategy];
    return single ? [single] : [];
  }
  return priority
    .map((name) => STRATEGY_BY_NAME[name])
    .filter((value): value is MatchStrategy => value !== undefined);
}
