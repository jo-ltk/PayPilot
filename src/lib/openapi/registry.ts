import { OpenAPIRegistry, extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { registerDashboardPaths } from "@/lib/openapi/dashboard-paths";
import { jsonOk, shopIdParam, success } from "@/lib/openapi/helpers";
import {
  acceptInviteSchema,
  inviteSchema,
  loginSchema,
  sessionSchema,
  shopifyAuthResultSchema,
} from "@/schemas/auth.schema";
import {
  settingsResponseSchema,
  settingsUpdateSchema,
  validateResponseSchema,
} from "@/schemas/settings.schema";

extendZodWithOpenApi(z);

/**
 * Registers auth and settings paths on the OpenAPI registry.
 * @param registry - OpenAPI registry
 */
function registerAuthAndSettingsPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/api/health",
    summary: "Health check",
    responses: { 200: { description: "Service is healthy" } },
  });

  registry.registerPath({
    method: "post",
    path: "/api/auth/login",
    summary: "Standalone finance login",
    request: {
      body: { content: { "application/json": { schema: loginSchema } } },
    },
    responses: jsonOk("Session", success(sessionSchema)),
  });

  registry.registerPath({
    method: "post",
    path: "/api/auth/shopify",
    summary: "Shopify session token exchange",
    responses: jsonOk("Shop install", success(shopifyAuthResultSchema)),
  });

  registry.registerPath({
    method: "post",
    path: "/api/auth/invite/accept",
    summary: "Accept a team invite",
    request: {
      body: { content: { "application/json": { schema: acceptInviteSchema } } },
    },
    responses: jsonOk("Session", success(sessionSchema)),
  });

  registry.registerPath({
    method: "get",
    path: "/api/shops/{shopId}/settings",
    summary: "Read gateway (masked) and matching settings",
    request: { params: shopIdParam },
    responses: jsonOk("Current settings", success(settingsResponseSchema)),
  });

  registry.registerPath({
    method: "patch",
    path: "/api/shops/{shopId}/settings",
    summary: "Update gateway and/or matching settings",
    request: {
      params: shopIdParam,
      body: {
        content: { "application/json": { schema: settingsUpdateSchema } },
      },
    },
    responses: jsonOk("Updated settings", success(settingsResponseSchema)),
  });

  registry.registerPath({
    method: "post",
    path: "/api/shops/{shopId}/settings/validate",
    summary: "Validate stored Easebuzz credentials",
    request: { params: shopIdParam },
    responses: jsonOk("Validation result", success(validateResponseSchema)),
  });

  registry.registerPath({
    method: "post",
    path: "/api/shops/{shopId}/settings/invite",
    summary: "Invite a team member",
    request: {
      params: shopIdParam,
      body: { content: { "application/json": { schema: inviteSchema } } },
    },
    responses: jsonOk("Invite token", success(z.object({ inviteToken: z.string() }))),
  });
}

/**
 * Builds the full OpenAPI registry for SettleFlow dashboard and auth APIs.
 * @returns Populated OpenAPI registry
 */
export function buildOpenApiRegistry(): OpenAPIRegistry {
  const registry = new OpenAPIRegistry();
  registerAuthAndSettingsPaths(registry);
  registerDashboardPaths(registry);
  return registry;
}
