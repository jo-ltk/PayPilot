import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KpiCard } from "@/components/shared/kpi-card";

describe("KpiCard", () => {
  it("renders title and value", () => {
    render(
      <KpiCard title="Total Collected" value="₹12,00,000" description="Last 30 days" />,
    );

    expect(screen.getByText("Total Collected")).toBeInTheDocument();
    expect(screen.getByText("₹12,00,000")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("renders trend indicator", () => {
    render(
      <KpiCard
        title="Match Rate"
        value="98.3%"
        trend={{ value: "+2.1%", direction: "up" }}
      />,
    );

    expect(screen.getByText("+2.1%")).toHaveClass("text-success");
  });
});
