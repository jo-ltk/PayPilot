import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AmountBadge } from "@/components/shared/amount-badge";
import { CurrencyDisplay } from "@/components/shared/currency-display";

describe("AmountBadge", () => {
  it("formats positive amounts", () => {
    render(<AmountBadge paise={150000} direction="positive" />);

    expect(screen.getByText(/1,?500/)).toBeInTheDocument();
  });

  it("applies negative styling", () => {
    render(<AmountBadge paise={50000} direction="negative" />);

    expect(screen.getByText(/500/).parentElement).toHaveClass("text-destructive");
  });
});

describe("CurrencyDisplay", () => {
  it("renders formatted currency", () => {
    render(<CurrencyDisplay paise={100000} />);

    expect(screen.getByText(/1,?000/)).toBeInTheDocument();
  });
});
