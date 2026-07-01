import { z } from "zod";

import { paginationMetaSchema } from "@/schemas/payments.schema";

/**
 * Wraps a payload schema in the standard success envelope.
 * @param schema - Data payload schema
 * @returns Envelope schema `{ success: true, data }`
 */
export function success<T extends z.ZodTypeAny>(schema: T) {
  return z.object({ success: z.literal(true), data: schema });
}

/**
 * Wraps an item schema in the paginated list envelope.
 * @param schema - Item schema
 * @returns Envelope `{ success: true, data: item[], meta }`
 */
export function listEnvelope<T extends z.ZodTypeAny>(schema: T) {
  return z.object({
    success: z.literal(true),
    data: z.array(schema),
    meta: paginationMetaSchema,
  });
}

/** Path param schema for shop-scoped routes. */
export const shopIdParam = z.object({ shopId: z.string() });

/** Shared query params for list endpoints. */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().optional(),
  pageSize: z.coerce.number().int().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

/**
 * Builds a 200 JSON response object for OpenAPI.
 * @param description - Response description
 * @param schema - Response body schema
 * @returns OpenAPI responses map
 */
export function jsonOk<T extends z.ZodTypeAny>(description: string, schema: T) {
  return {
    200: { description, content: { "application/json": { schema } } },
  };
}
