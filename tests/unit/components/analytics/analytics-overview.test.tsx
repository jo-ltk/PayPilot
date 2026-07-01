import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AnalyticsOverview } from "@/components/analytics/analytics-overview";
import type { AnalyticsInsightsData } from "@/hooks/use-analytics-insights";

const mockAnalytics = {
  from: "2026-05-01",
  to: "2026-06-01",
  kpis: {
    transactionCount: 120,
    grossVolumePaise: 12000000,
    feesPaise: 240000,
    netVolumePaise: 11760000,
    refundCount: 3,
    refundTotalPaise: 150000,
    settlementCount: 4,
    settlementTotalPaise: 10000000,
    pendingSettlementPaise: 1760000,
    reconciliation: { AMOUNT_MISMATCH: 2, MATCHED: 118 },
    matchRate: 0.983,
  },
  series: [{ date: "2026-05-01", grossPaise: 400000, count: 4 }],
};

const mockInsights: AnalyticsInsightsData = {
  successRate: 97.5,
  paymentHealthScore: 92,
  refundPercentage: 1.25,
  topPaymentDays: mockAnalytics.series,
  largestSettlement: null,
  averageSettlementDays: 3,
  gatewayPerformance: [],
  successRateTrend: [],
  matchRateTrend: [],
  settlements: [],
  refunds: [],
};

describe("AnalyticsOverview", () => {
  it("renders overview metric titles", async () => {
    render(
      <AnalyticsOverview
        data={mockAnalytics}
        insights={mockInsights}
        isLoading={false}
        isError={false}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Revenue Analytics")).toBeInTheDocument();
    });

    expect(screen.getByText("Settlement Analytics")).toBeInTheDocument();
    expect(screen.getByText("Match Rate")).toBeInTheDocument();
    expect(screen.getByText("Payment Health Score")).toBeInTheDocument();
  });

  it("shows loading skeletons", () => {
    const { container } = render(
      <AnalyticsOverview
        isLoading
        isError={false}
      />,
    );

    expect(container.querySelector(".skeleton-shimmer")).toBeTruthy();
  });
});
