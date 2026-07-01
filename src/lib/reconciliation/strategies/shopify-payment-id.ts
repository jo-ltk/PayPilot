import {
  readGatewayField,
  type MatchStrategy,
} from "@/lib/reconciliation/strategies";

/**
 * Matches a mapped UDF field (default `udf2`) against the Shopify payment id.
 */
export const shopifyPaymentIdStrategy: MatchStrategy = {
  name: "SHOPIFY_PAYMENT_ID",
  transactionKey: (txn, mapping) =>
    readGatewayField(txn, mapping.paymentId ?? "udf2"),
  orderKey: (order) => order.shopifyPaymentId,
};
