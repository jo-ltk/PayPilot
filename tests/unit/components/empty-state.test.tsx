import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Inbox } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "@/components/shared/empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No transactions yet"
        description="Payments will appear here once orders are processed."
      />,
    );

    expect(screen.getByRole("heading", { name: "No transactions yet" })).toBeInTheDocument();
    expect(
      screen.getByText("Payments will appear here once orders are processed."),
    ).toBeInTheDocument();
  });

  it("calls the action handler when the button is clicked", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <EmptyState
        icon={Inbox}
        title="No mismatches"
        description="Everything is reconciled."
        actionLabel="Refresh"
        onAction={onAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect(onAction).toHaveBeenCalledOnce();
  });

  it("does not render an action button without a handler", () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No mismatches"
        description="Everything is reconciled."
        actionLabel="Refresh"
      />,
    );

    expect(screen.queryByRole("button", { name: "Refresh" })).not.toBeInTheDocument();
  });
});
