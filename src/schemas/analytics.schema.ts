import { z } from "zod";

/** Headline KPIs for a shop's dashboard. */
export const analyticsKpisSchema = z.object({
  transactionCount: z.number().int(),
  grossVolumePaise: z.number().int(),
  feesPaise: z.number().int(),
  netVolumePaise: z.number().int(),
  refundCount: z.number().int(),
  refundTotalPaise: z.number().int(),
  settlementCount: z.number().int(),
  settlementTotalPaise: z.number().int(),
  pendingSettlementPaise: z.number().int(),
  reconciliation: z.record(z.string(), z.number().int()),
  matchRate: z.number(),
});

export type AnalyticsKpis = z.infer<typeof analyticsKpisSchema>;

/** A single point in the daily volume time series. */
export const analyticsSeriesPointSchema = z.object({
  date: z.string(),
  grossPaise: z.number().int(),
  count: z.number().int(),
});

export type AnalyticsSeriesPoint = z.infer<typeof analyticsSeriesPointSchema>;

/** Full analytics response: KPIs plus a daily volume series. */
export const analyticsResponseSchema = z.object({
  from: z.string().nullable(),
  to: z.string().nullable(),
  kpis: analyticsKpisSchema,
  series: z.array(analyticsSeriesPointSchema),
});

export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;
