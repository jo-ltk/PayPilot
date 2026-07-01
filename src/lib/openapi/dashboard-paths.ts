import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import {
  jsonOk,
  listEnvelope,
  listQuerySchema,
  shopIdParam,
  success,
} from "@/lib/openapi/helpers";
import { analyticsResponseSchema } from "@/schemas/analytics.schema";
import {
  reconcileTriggerSchema,
  reconciliationViewSchema,
  refundViewSchema,
  settlementViewSchema,
  shopViewSchema,
  transactionViewSchema,
} from "@/schemas/payments.schema";

/**
 * Registers a shop-scoped paginated list endpoint.
 * @param registry - OpenAPI registry
 * @param path - Route path
 * @param summary - Endpoint summary
 * @param item - Item schema
 */
function registerList(
  registry: OpenAPIRegistry,
  path: string,
  summary: string,
  item: Parameters<typeof listEnvelope>[0],
): void {
  registry.registerPath({
    method: "get",
    path,
    summary,
    request: { params: shopIdParam, query: listQuerySchema },
    responses: jsonOk(summary, listEnvelope(item)),
  });
}

/**
 * Registers all dashboard data endpoints (lists, analytics, reconcile).
 * @param registry - OpenAPI registry
 */
export function registerDashboardPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/shops",
    summary: "List shops for the current user",
    responses: jsonOk("Shops", success(shopViewSchema.array())),
  });

  registerList(
    registry,
    "/api/shops/{shopId}/payments",
    "List gateway transactions",
    transactionViewSchema,
  );
  registerList(
    registry,
    "/api/shops/{shopId}/settlements",
    "List settlements",
    settlementViewSchema,
  );
  registerList(
    registry,
    "/api/shops/{shopId}/refunds",
    "List refunds",
    refundViewSchema,
  );
  registerList(
    registry,
    "/api/shops/{shopId}/reconciliation",
    "List reconciliation records",
    reconciliationViewSchema,
  );

  registry.registerPath({
    method: "patch",
    path: "/api/shops/{shopId}/reconciliation/{id}",
    summary: "Mark a reconciliation record resolved",
    request: {
      params: shopIdParam.extend({ id: shopIdParam.shape.shopId }),
    },
    responses: jsonOk("Resolved record", success(reconciliationViewSchema)),
  });

  registry.registerPath({
    method: "get",
    path: "/api/shops/{shopId}/analytics",
    summary: "Analytics KPIs and daily volume series",
    request: { params: shopIdParam },
    responses: jsonOk("Analytics", success(analyticsResponseSchema)),
  });

  registry.registerPath({
    method: "post",
    path: "/api/shops/{shopId}/reconcile",
    summary: "Trigger reconciliation (async)",
    request: { params: shopIdParam },
    responses: jsonOk("Queued", success(reconcileTriggerSchema)),
  });
}
