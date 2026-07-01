import {
  readGatewayField,
  type MatchStrategy,
} from "@/lib/reconciliation/strategies";

/**
 * Matches a UDF field (default `udf1`) against the Shopify order name (`#1001`).
 */
export const udfOrderNameStrategy: MatchStrategy = {
  name: "UDF_ORDER_NAME",
  transactionKey: (txn, mapping) =>
    readGatewayField(txn, mapping.orderName ?? "udf1"),
  orderKey: (order) => order.orderName,
};
