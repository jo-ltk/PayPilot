import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BreadcrumbNav } from "@/components/shared/breadcrumb-nav";
import { SectionHeader } from "@/components/shared/section-header";

describe("BreadcrumbNav", () => {
  it("renders breadcrumb trail", () => {
    render(
      <BreadcrumbNav
        items={[
          { label: "Shops", href: "/shops" },
          { label: "Transactions" },
        ]}
      />,
    );

    expect(screen.getByText("Shops")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });
});

describe("SectionHeader", () => {
  it("renders title and description", () => {
    render(
      <SectionHeader
        title="Recent activity"
        description="Latest mismatches and settlements"
      />,
    );

    expect(screen.getByRole("heading", { name: "Recent activity" })).toBeInTheDocument();
    expect(
      screen.getByText("Latest mismatches and settlements"),
    ).toBeInTheDocument();
  });
});
