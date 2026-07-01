/** Admin GraphQL query to page through a shop's orders, sorted by update time. */
export const ORDERS_QUERY = `
  query SettleFlowOrders($cursor: String, $query: String) {
    orders(first: 50, after: $cursor, query: $query, sortKey: UPDATED_AT) {
      pageInfo { hasNextPage endCursor }
      nodes {
        legacyResourceId
        name
        processedAt
        displayFinancialStatus
        paymentGatewayNames
        currentTotalPriceSet { shopMoney { amount currencyCode } }
      }
    }
  }
`;

export type ShopifyGraphQLOrder = {
  legacyResourceId: string;
  name: string;
  processedAt: string | null;
  displayFinancialStatus: string | null;
  paymentGatewayNames: string[];
  currentTotalPriceSet: {
    shopMoney: { amount: string; currencyCode: string };
  };
};

export type OrdersQueryResult = {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: ShopifyGraphQLOrder[];
  };
};
