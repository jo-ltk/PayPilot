import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LoadingSkeleton } from "@/components/shared/loading-skeleton";

describe("LoadingSkeleton", () => {
  it("renders a card skeleton by default", () => {
    const { container } = render(<LoadingSkeleton />);

    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(3);
  });

  it("renders six card placeholders for page variant", () => {
    render(<LoadingSkeleton variant="page" />);

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(6);
  });

  it("renders the requested number of table rows", () => {
    render(<LoadingSkeleton variant="table" rows={4} />);

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBe(5);
  });

  it("renders a chart skeleton block", () => {
    render(<LoadingSkeleton variant="chart" />);

    expect(document.querySelectorAll('[data-slot="skeleton"]').length).toBe(2);
  });
});
