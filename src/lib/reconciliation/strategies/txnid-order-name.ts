import {
  readGatewayField,
  type MatchStrategy,
} from "@/lib/reconciliation/strategies";

/**
 * Matches the gateway `txnid` against the Shopify order name (`#1001`).
 */
export const txnidOrderNameStrategy: MatchStrategy = {
  name: "TXNID_ORDER_NAME",
  transactionKey: (txn) => readGatewayField(txn, "txnid"),
  orderKey: (order) => order.orderName,
};
