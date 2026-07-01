"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DataTable } from "@/components/shared/data-table";
import { DataTableEmpty } from "@/components/shared/data-table-empty";
import { useDataTable } from "@/hooks/use-data-table";

type Row = { id: string; name: string };

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
];

function TableFixture({ data }: { data: Row[] }) {
  const table = useDataTable({ data, columns, pageSize: 5 });
  return (
    <DataTable
      table={table}
      columns={columns}
      emptyState={<DataTableEmpty title="No rows" />}
    />
  );
}

describe("DataTable", () => {
  it("renders rows", () => {
    render(<TableFixture data={[{ id: "1", name: "Payment A" }]} />);

    expect(screen.getByText("Payment A")).toBeInTheDocument();
  });

  it("shows empty state when no data", () => {
    render(<TableFixture data={[]} />);

    expect(screen.getByText("No rows")).toBeInTheDocument();
  });
});
