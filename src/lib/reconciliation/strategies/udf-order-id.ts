import {
  readGatewayField,
  type MatchStrategy,
} from "@/lib/reconciliation/strategies";

/**
 * Matches a UDF field (default `udf1`) against the Shopify numeric order id.
 */
export const udfOrderIdStrategy: MatchStrategy = {
  name: "UDF_ORDER_ID",
  transactionKey: (txn, mapping) =>
    readGatewayField(txn, mapping.orderId ?? "udf1"),
  orderKey: (order) => order.shopifyOrderId,
};
