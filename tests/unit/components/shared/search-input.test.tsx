import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SearchInput } from "@/components/shared/search-input";

describe("SearchInput", () => {
  it("calls onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SearchInput value="" onChange={onChange} />);

    await user.type(screen.getByRole("searchbox"), "order");

    expect(onChange).toHaveBeenCalled();
  });

  it("clears value via clear button", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<SearchInput value="test" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(onChange).toHaveBeenCalledWith("");
  });
});
