"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import {
  AmountTrendChart,
  RateTrendChart,
} from "@/components/analytics/analytics-charts";
import { AnalyticsInsights } from "@/components/analytics/analytics-insights";
import { AnalyticsOverview } from "@/components/analytics/analytics-overview";
import { AnalyticsToolbar } from "@/components/analytics/analytics-toolbar";
import { GatewayBreakdownChart } from "@/components/analytics/gateway-breakdown-chart";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { PageTransition } from "@/components/shared/page-transition";
import { SectionHeader } from "@/components/shared/section-header";
import { useAnalytics } from "@/hooks/use-analytics";
import { useAnalyticsInsights } from "@/hooks/use-analytics-insights";
import { useShopContext } from "@/hooks/use-shop-context";
import { defaultAnalyticsRange } from "@/lib/analytics-range";
import { normalizeMatchRate } from "@/lib/analytics-metrics";
import { buildCsv, downloadCsv } from "@/lib/export-csv";
import type { DateRange } from "@/types/common";

/**
 * Builds a combined CSV export for analytics overview metrics.
 * @param analytics - Analytics API response
 * @param insights - Derived insights
 * @returns CSV string
 */
function buildAnalyticsExportCsv(
  analytics: NonNullable<ReturnType<typeof useAnalytics>["data"]>,
  insights: NonNullable<ReturnType<typeof useAnalyticsInsights>["data"]>,
): string {
  const rows = [
    {
      metric: "Gross Revenue (paise)",
      value: analytics.kpis.grossVolumePaise,
    },
    {
      metric: "Settlement Total (paise)",
      value: analytics.kpis.settlementTotalPaise,
    },
    {
      metric: "Refund Total (paise)",
      value: analytics.kpis.refundTotalPaise,
    },
    {
      metric: "Match Rate (%)",
      value: normalizeMatchRate(analytics.kpis.matchRate).toFixed(1),
    },
    {
      metric: "Success Rate (%)",
      value: insights.successRate.toFixed(1),
    },
    {
      metric: "Payment Health Score",
      value: insights.paymentHealthScore,
    },
  ];

  return buildCsv(rows, [
    { header: "Metric", value: (row) => row.metric },
    { header: "Value", value: (row) => row.value },
  ]);
}

/** Shared analytics page wired to the analytics API. */
export function AnalyticsPage() {
  const queryClient = useQueryClient();
  const { shopId } = useShopContext();
  const [dateRange, setDateRange] = useState<DateRange>(defaultAnalyticsRange);

  const analytics = useAnalytics(shopId, dateRange);
  const insights = useAnalyticsInsights(shopId, dateRange, analytics.data);

  const isLoading = analytics.isLoading || insights.isLoading;
  const isError = analytics.isError;
  const isInsightsError = insights.isError;

  const refresh = useCallback(() => {
    if (!shopId) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ["shop", shopId] });
  }, [queryClient, shopId]);

  const handleExportAll = useCallback(() => {
    if (!analytics.data || !insights.data) {
      return;
    }

    downloadCsv(
      "analytics-overview.csv",
      buildAnalyticsExportCsv(analytics.data, insights.data),
    );
  }, [analytics.data, insights.data]);

  const revenueSeries = useMemo(
    () =>
      (analytics.data?.series ?? []).map((point) => ({
        date: point.date,
        amountPaise: point.grossPaise,
        count: point.count,
      })),
    [analytics.data?.series],
  );

  const errorMessage = analytics.error?.message;

  if (isError) {
    return (
      <PageTransition className="space-y-6">
        <PageHeader
          title="Analytics"
          description="Explore trends, gateway mix, and settlement performance."
        />
        <ErrorState
          message={errorMessage ?? "Failed to load analytics"}
          onRetry={refresh}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Explore trends, gateway mix, and settlement performance."
      />

      <AnalyticsToolbar
        dateRange={dateRange}
        isRefreshing={analytics.isFetching || insights.isFetching}
        onDateRangeChange={setDateRange}
        onRefresh={refresh}
        onExportAll={handleExportAll}
      />

      <section className="space-y-4" aria-labelledby="analytics-overview-heading">
        <SectionHeader
          title="Overview"
          description="Headline metrics for the selected period"
        />
        <AnalyticsOverview
          data={analytics.data}
          insights={insights.data}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          onRetry={refresh}
        />
      </section>

      <section className="space-y-4" aria-labelledby="analytics-charts-heading">
        <SectionHeader
          title="Charts"
          description="Trends across revenue, settlements, refunds, and rates"
        />
        <div className="grid gap-6 xl:grid-cols-2">
          <AmountTrendChart
            title="Revenue Trend"
            description="Daily collected payment volume"
            series={revenueSeries}
            kind="area"
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            onRetry={refresh}
            csvFilename="revenue-trend.csv"
            pngFilename="revenue-trend.png"
            ariaLabel="Revenue trend chart"
            gradientId="analyticsRevenue"
          />
          <AmountTrendChart
            title="Settlement Trend"
            description="Daily payout volume to your bank"
            series={insights.data?.settlements ?? []}
            kind="bar"
            isLoading={isLoading}
            isError={isInsightsError}
            errorMessage={insights.error?.message}
            onRetry={refresh}
            csvFilename="settlement-trend.csv"
            pngFilename="settlement-trend.png"
            ariaLabel="Settlement trend chart"
            gradientId="analyticsSettlement"
          />
          <AmountTrendChart
            title="Refund Trend"
            description="Customer refunds over the selected period"
            series={insights.data?.refunds ?? []}
            kind="area"
            isLoading={isLoading}
            isError={isInsightsError}
            errorMessage={insights.error?.message}
            onRetry={refresh}
            csvFilename="refund-trend.csv"
            pngFilename="refund-trend.png"
            ariaLabel="Refund trend chart"
            gradientId="analyticsRefund"
          />
          <RateTrendChart
            title="Match Rate Trend"
            description="Daily reconciliation match rate"
            series={insights.data?.matchRateTrend ?? []}
            isLoading={isLoading}
            isError={isInsightsError}
            errorMessage={insights.error?.message}
            onRetry={refresh}
            csvFilename="match-rate-trend.csv"
            pngFilename="match-rate-trend.png"
            ariaLabel="Match rate trend chart"
          />
          <RateTrendChart
            title="Payment Success Trend"
            description="Daily payment success rate"
            series={insights.data?.successRateTrend ?? []}
            isLoading={isLoading}
            isError={isInsightsError}
            errorMessage={insights.error?.message}
            onRetry={refresh}
            csvFilename="payment-success-trend.csv"
            pngFilename="payment-success-trend.png"
            ariaLabel="Payment success trend chart"
          />
          <GatewayBreakdownChart
            data={insights.data?.gatewayPerformance}
            isLoading={isLoading}
            isError={isInsightsError}
            errorMessage={insights.error?.message}
            onRetry={refresh}
          />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="analytics-insights-heading">
        <SectionHeader
          title="Insights"
          description="Key findings from your payment data"
        />
        <AnalyticsInsights insights={insights.data} isLoading={isLoading} />
      </section>
    </PageTransition>
  );
}
