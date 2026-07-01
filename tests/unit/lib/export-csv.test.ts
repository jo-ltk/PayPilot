import { describe, expect, it } from "vitest";

import { buildCsv, escapeCsvCell } from "@/lib/export-csv";

describe("export-csv", () => {
  it("escapes commas and quotes", () => {
    expect(escapeCsvCell('value, with "quotes"')).toBe(
      '"value, with ""quotes"""',
    );
  });

  it("builds a CSV document with headers and rows", () => {
    const csv = buildCsv(
      [{ id: "txn-1", amount: 100 }],
      [
        { header: "ID", value: (row) => row.id },
        { header: "Amount", value: (row) => row.amount },
      ],
    );

    expect(csv).toBe("ID,Amount\ntxn-1,100");
  });
});
