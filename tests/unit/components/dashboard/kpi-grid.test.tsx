import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IndianRupee } from "lucide-react";

import { KpiGrid } from "@/components/dashboard/kpi-grid";

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
  series: [
    { date: "2026-05-01", grossPaise: 400000, count: 4 },
    { date: "2026-05-02", grossPaise: 350000, count: 3 },
  ],
};

describe("KpiGrid", () => {
  it("renders loading skeletons", () => {
    const { container } = render(
      <KpiGrid isLoading isError={false} />,
    );

    expect(container.querySelectorAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
  });

  it("renders KPI values from analytics data", () => {
    render(
      <KpiGrid
        data={mockAnalytics}
        isLoading={false}
        isError={false}
      />,
    );

    expect(screen.getByText("Today's Sales")).toBeInTheDocument();
    expect(screen.getByText("₹1,20,000.00")).toBeInTheDocument();
    expect(screen.getByText("Settlement Mismatches")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders error state", () => {
    render(
      <KpiGrid
        isLoading={false}
        isError
        errorMessage="Analytics failed"
      />,
    );

    expect(screen.getByText("KPIs unavailable")).toBeInTheDocument();
    expect(screen.getByText("Analytics failed")).toBeInTheDocument();
  });

  it("renders empty state when data is missing", () => {
    render(
      <KpiGrid isLoading={false} isError={false} />,
    );

    expect(screen.getByText("No metrics yet")).toBeInTheDocument();
    expect(screen.getByText("No metrics yet").closest("div")).toBeTruthy();
  });
});

describe("KpiCard shared component", () => {
  it("renders icon and trend from grid output", async () => {
    const { KpiCard } = await import("@/components/shared/kpi-card");

    render(
      <KpiCard
        title="Today's Sales"
        value="₹1,00,000.00"
        description="10 transactions"
        trend={{ value: "+5.0% vs prior period", direction: "up" }}
        icon={IndianRupee}
      />,
    );

    expect(screen.getByText("Today's Sales")).toBeInTheDocument();
    expect(screen.getByText("+5.0% vs prior period")).toHaveClass("text-success");
  });
});
