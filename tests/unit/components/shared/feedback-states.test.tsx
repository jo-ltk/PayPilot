import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { SuccessState } from "@/components/shared/success-state";

describe("ConfirmationDialog", () => {
  it("calls onConfirm when confirmed", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmationDialog
        open
        onOpenChange={vi.fn()}
        title="Confirm action"
        description="Are you sure?"
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onConfirm).toHaveBeenCalledOnce();
  });
});

describe("SuccessState", () => {
  it("renders success message", () => {
    render(<SuccessState message="Settings saved successfully." />);

    expect(screen.getByText("Settings saved successfully.")).toBeInTheDocument();
  });
});
