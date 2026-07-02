"use client";

import { memo, useCallback } from "react";

import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { RefundTrendChart } from "@/components/dashboard/refund-trend-chart";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { SettlementTrendChart } from "@/components/dashboard/settlement-trend-chart";
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
    <div className="retro-dash -mx-4 -my-6 min-h-full space-y-8 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <header className="max-w-4xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {getGreeting()}
        </p>
        <h1 className="font-retro text-4xl font-medium leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
          Your payments, settlements &amp; reconciliation health
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Everything moving through your store, settled and accounted for.
        </p>
      </header>

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
          <h2 className="font-retro text-2xl font-medium tracking-tight">Quick Actions</h2>
          <p className="text-sm text-muted-foreground">
            Jump to common tasks without leaving the dashboard
          </p>
        </div>
        <QuickActions />
      </section>
    </div>
  );
});
