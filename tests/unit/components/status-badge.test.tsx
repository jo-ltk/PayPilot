import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "@/components/shared/status-badge";

describe("StatusBadge", () => {
  it("renders the label text", () => {
    render(<StatusBadge label="Settled" variant="success" />);

    expect(screen.getByText("Settled")).toBeInTheDocument();
  });

  it("applies success styling", () => {
    render(<StatusBadge label="Matched" variant="success" />);

    expect(screen.getByText("Matched").parentElement).toHaveClass("text-success");
  });

  it("applies warning styling for pending items", () => {
    render(<StatusBadge label="Pending" variant="pending" />);

    expect(screen.getByText("Pending").parentElement).toHaveClass("text-warning");
  });

  it("applies destructive styling for errors", () => {
    render(<StatusBadge label="Failed" variant="error" />);

    expect(screen.getByText("Failed").parentElement).toHaveClass("text-destructive");
  });
});
