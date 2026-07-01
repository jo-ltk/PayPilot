"use client";

import { memo, useCallback } from "react";

import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RefundTrendChart } from "@/components/dashboard/refund-trend-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { SettlementTrendChart } from "@/components/dashboard/settlement-trend-chart";
import { PageHeader } from "@/components/layout/page-header";
import { useDashboardContext } from "@/components/providers/dashboard-provider";
import { useAnalytics } from "@/hooks/use-analytics";
import { useDashboardActivity } from "@/hooks/use-dashboard-activity";
import { useDashboardTrends } from "@/hooks/use-dashboard-trends";
import { useShopContext } from "@/hooks/use-shop-context";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

/** Shared dashboard page wired to analytics and list APIs. */
export const DashboardPage = memo(function DashboardPage() {
  const { shopId } = useShopContext();
  const { dateRange, refresh } = useDashboardContext();

  const analytics = useAnalytics(shopId, dateRange);
  const trends = useDashboardTrends(shopId, dateRange);
  const activity = useDashboardActivity(shopId, dateRange);

  const handleRetry = useCallback(() => {
    refresh();
  }, [refresh]);

  const errorMessage = analytics.error?.message;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`${getGreeting()}. Here is your payment health overview.`}
      />

      <KpiGrid
        data={analytics.data}
        isLoading={analytics.isLoading}
        isError={analytics.isError}
        errorMessage={errorMessage}
        onRetry={handleRetry}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <RevenueChart
          series={analytics.data?.series}
          isLoading={analytics.isLoading}
          isError={analytics.isError}
          errorMessage={errorMessage}
          onRetry={handleRetry}
        />
        <SettlementTrendChart
          series={trends.data?.settlements}
          isLoading={trends.isLoading}
          isError={trends.isError}
          errorMessage={trends.error?.message}
          onRetry={handleRetry}
        />
      </div>

      <RefundTrendChart
        series={trends.data?.refunds}
        isLoading={trends.isLoading}
        isError={trends.isError}
        errorMessage={trends.error?.message}
        onRetry={handleRetry}
      />

      <RecentActivity
        items={activity.data}
        isLoading={activity.isLoading}
        isError={activity.isError}
        errorMessage={activity.error?.message}
        onRetry={handleRetry}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">
            Jump to common tasks without leaving the dashboard
          </p>
        </div>
        <QuickActions />
      </section>
    </div>
  );
});
