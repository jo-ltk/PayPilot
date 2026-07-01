"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ServerDataTable } from "@/components/shared/server-data-table";
import { useServerDataTable } from "@/hooks/use-server-data-table";

type Row = { id: string; name: string };

const columns: ColumnDef<Row>[] = [{ accessorKey: "name", header: "Name" }];

function TableFixture({
  data,
  onRowClick,
}: {
  data: Row[];
  onRowClick?: (row: Row) => void;
}) {
  const table = useServerDataTable({
    data,
    columns,
    pageIndex: 1,
    pageSize: 10,
    pageCount: 1,
    sortOrder: "desc",
    onPaginationChange: vi.fn(),
  });

  return (
    <ServerDataTable
      table={table}
      columns={columns}
      onRowClick={onRowClick}
    />
  );
}

describe("ServerDataTable", () => {
  it("renders rows and handles row click", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();

    render(
      <TableFixture
        data={[{ id: "1", name: "Settlement A" }]}
        onRowClick={onRowClick}
      />,
    );

    await user.click(screen.getByText("Settlement A"));

    expect(onRowClick).toHaveBeenCalledWith({ id: "1", name: "Settlement A" });
  });
});
