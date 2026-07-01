/** A single CSV column definition. */
export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

/**
 * Escapes a CSV cell value per RFC 4180.
 * @param value - Raw cell value
 * @returns Escaped CSV cell
 */
export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  const text = String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/**
 * Builds a CSV string from rows and column definitions.
 * @param rows - Data rows
 * @param columns - Column mapping
 * @returns CSV document string
 */
export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((column) => escapeCsvCell(column.header)).join(",");
  const body = rows
    .map((row) =>
      columns.map((column) => escapeCsvCell(column.value(row))).join(","),
    )
    .join("\n");

  return `${header}\n${body}`;
}

/**
 * Triggers a browser download of a CSV file.
 * @param filename - Download filename
 * @param content - CSV document string
 */
export function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
