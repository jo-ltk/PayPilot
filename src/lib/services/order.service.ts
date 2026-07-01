import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { toPaise } from "@/lib/money";
import type { ShopifyGraphQLOrder } from "@/lib/shopify/queries/orders";
import { shopifyWebhookOrderSchema } from "@/schemas/shopify.schema";

export type OrderUpsertData = {
  shopifyOrderId: string;
  orderName: string;
  orderNumber: number;
  totalPricePaise: number;
  currency: string;
  financialStatus: string;
  paymentGatewayNames: string[];
  shopifyPaymentId: string | null;
  processedAt: Date | null;
  rawPayload: Prisma.InputJsonValue;
};

/**
 * Parses the leading numeric portion of a Shopify order name (e.g. `#1001`).
 * @param name - Order name
 * @returns Parsed order number, or 0 when none present
 */
function parseOrderNumber(name: string): number {
  const digits = name.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

/**
 * Maps a Shopify `orders/*` webhook payload to upsertable order data.
 * @param payload - Raw parsed webhook JSON
 * @returns Normalized order data
 * @throws {z.ZodError} When the payload is missing required fields
 */
export function mapWebhookOrder(payload: unknown): OrderUpsertData {
  const order = shopifyWebhookOrderSchema.parse(payload);
  const amount = order.total_price ?? order.current_total_price ?? "0";
  return {
    shopifyOrderId: order.id,
    orderName: order.name,
    orderNumber: order.order_number,
    totalPricePaise: toPaise(amount),
    currency: order.currency,
    financialStatus: order.financial_status ?? "pending",
    paymentGatewayNames: order.payment_gateway_names,
    shopifyPaymentId: null,
    processedAt: order.processed_at ? new Date(order.processed_at) : null,
    rawPayload: payload as Prisma.InputJsonValue,
  };
}

/**
 * Maps a Shopify Admin GraphQL order node to upsertable order data.
 * @param node - GraphQL order node
 * @returns Normalized order data
 */
export function mapGraphQLOrder(node: ShopifyGraphQLOrder): OrderUpsertData {
  return {
    shopifyOrderId: node.legacyResourceId,
    orderName: node.name,
    orderNumber: parseOrderNumber(node.name),
    totalPricePaise: toPaise(node.currentTotalPriceSet.shopMoney.amount),
    currency: node.currentTotalPriceSet.shopMoney.currencyCode,
    financialStatus: node.displayFinancialStatus ?? "pending",
    paymentGatewayNames: node.paymentGatewayNames,
    shopifyPaymentId: null,
    processedAt: node.processedAt ? new Date(node.processedAt) : null,
    rawPayload: node as unknown as Prisma.InputJsonValue,
  };
}

/**
 * Upserts a Shopify order for a shop, keyed by `(shopId, shopifyOrderId)`.
 * @param shopId - Owning shop id
 * @param data - Normalized order data
 */
export async function upsertOrder(
  shopId: string,
  data: OrderUpsertData,
): Promise<void> {
  await prisma.shopifyOrder.upsert({
    where: {
      shopId_shopifyOrderId: { shopId, shopifyOrderId: data.shopifyOrderId },
    },
    create: { shopId, ...data },
    update: data,
  });
}
