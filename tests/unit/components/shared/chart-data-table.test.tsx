import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChartDataTable } from "@/components/shared/chart-data-table";

describe("ChartDataTable", () => {
  it("renders accessible table with caption and headers", () => {
    render(
      <ChartDataTable
        caption="Revenue by day"
        columns={[
          { header: "Date", key: "date" },
          { header: "Revenue", key: "revenue", align: "right" },
        ]}
        rows={[
          { date: "01 Jan 2026", revenue: "₹1,000.00" },
          { date: "02 Jan 2026", revenue: "₹2,500.00" },
        ]}
      />,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Date" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Revenue" })).toBeInTheDocument();
    expect(screen.getByText("₹2,500.00")).toBeInTheDocument();
  });
});
