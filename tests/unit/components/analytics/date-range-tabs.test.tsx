import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DateRangeTabs } from "@/components/analytics/date-range-tabs";
import { resolveAnalyticsPreset } from "@/lib/analytics-range";

describe("DateRangeTabs", () => {
  it("renders preset labels", () => {
    render(
      <DateRangeTabs
        value={resolveAnalyticsPreset("30d")}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Last 7 Days")).toBeInTheDocument();
    expect(screen.getByText("Last 30 Days")).toBeInTheDocument();
  });

  it("calls onChange when a preset is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DateRangeTabs
        value={resolveAnalyticsPreset("30d")}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByText("Today"));
    expect(onChange).toHaveBeenCalled();
  });
});
