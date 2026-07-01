import { z } from "zod";

/**
 * Subset of the Shopify `orders/*` webhook payload used to upsert orders.
 * Unknown fields are preserved via passthrough so the raw payload is retained.
 */
export const shopifyWebhookOrderSchema = z
  .object({
    id: z.union([z.number(), z.string()]).transform(String),
    name: z.string(),
    order_number: z.number().int().default(0),
    total_price: z.string().optional(),
    current_total_price: z.string().optional(),
    currency: z.string().default("INR"),
    financial_status: z.string().nullable().optional(),
    payment_gateway_names: z.array(z.string()).default([]),
    processed_at: z.string().nullable().optional(),
  })
  .passthrough();

export type ShopifyWebhookOrder = z.infer<typeof shopifyWebhookOrderSchema>;
