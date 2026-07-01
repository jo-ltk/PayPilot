/**
 * Frontend API types — re-exported from backend Zod schemas.
 * Regenerate via `pnpm openapi:types` when the OpenAPI spec is updated.
 */

export type {
  AnalyticsKpis,
  AnalyticsResponse,
  AnalyticsSeriesPoint,
} from "@/schemas/analytics.schema";

export type {
  PaginationMetaView as PaginationMeta,
  ReconcileTrigger,
  ReconciliationView,
  RefundView,
  SettlementView,
  ShopView,
  TransactionView,
} from "@/schemas/payments.schema";

export type { PaginationMeta as ApiPaginationMeta } from "@/lib/api/response";

export type { HealthResponse } from "@/types/common";
