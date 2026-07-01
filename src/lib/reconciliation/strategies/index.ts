/** A Shopify order reduced to the fields used for matching. */
export type MatchableOrder = {
  id: string;
  shopifyOrderId: string;
  orderName: string;
  shopifyPaymentId: string | null;
};

/** Gateway transaction fields available as matching candidates. */
export type GatewayFields = {
  txnid: string | null;
  udf1: string | null;
  udf2: string | null;
  udf3: string | null;
  udf4: string | null;
  udf5: string | null;
  udf6: string | null;
  udf7: string | null;
  udf8: string | null;
  udf9: string | null;
  udf10: string | null;
};

/** Maps logical names (orderId, orderName, paymentId) to gateway field names. */
export type FieldMapping = Record<string, string>;

/**
 * A single matching strategy: extracts a key from the transaction and the
 * corresponding key from an order. A match occurs when both are equal and
 * non-empty.
 */
export type MatchStrategy = {
  name: string;
  transactionKey(txn: GatewayFields, mapping: FieldMapping): string | null;
  orderKey(order: MatchableOrder): string | null;
};

/**
 * Reads a gateway field by name, treating empty strings as absent.
 * @param txn - Gateway transaction fields
 * @param fieldName - Gateway field name (e.g. `udf1`, `txnid`)
 * @returns Trimmed field value, or null when missing/empty
 */
export function readGatewayField(
  txn: GatewayFields,
  fieldName: string,
): string | null {
  const value = (txn as Record<string, string | null>)[fieldName];
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export { udfOrderIdStrategy } from "./udf-order-id";
export { udfOrderNameStrategy } from "./udf-order-name";
export { txnidOrderNameStrategy } from "./txnid-order-name";
export { shopifyPaymentIdStrategy } from "./shopify-payment-id";
export { resolveStrategies, STRATEGY_BY_NAME } from "./composite";
