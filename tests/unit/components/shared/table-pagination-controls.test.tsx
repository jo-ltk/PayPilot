"use client";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TablePaginationControls } from "@/components/shared/table-pagination-controls";

describe("TablePaginationControls", () => {
  it("renders clickable page numbers", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <TablePaginationControls
        currentPage={4}
        pageCount={10}
        total={250}
        canPrevious
        canNext
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "10", hidden: true }));

    expect(onPageChange).toHaveBeenCalledWith(10);
  });

  it("calls onPageChange when next is clicked", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <TablePaginationControls
        currentPage={4}
        pageCount={10}
        canPrevious
        canNext
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Go to next page" }));

    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it("lets users jump to a page from the mobile picker", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <TablePaginationControls
        currentPage={4}
        pageCount={10}
        canPrevious
        canNext
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole("combobox", { name: "Go to page" }));
    await user.click(screen.getByRole("option", { name: "Page 10" }));

    expect(onPageChange).toHaveBeenCalledWith(10);
  });
});
