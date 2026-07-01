import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface ChartDataColumn {
  header: string;
  key: string;
  align?: "left" | "right";
}

interface ChartDataTableProps {
  caption: string;
  columns: ChartDataColumn[];
  rows: Record<string, string | number>[];
  className?: string;
}

/**
 * Accessible tabular alternative for chart data (screen readers + keyboard).
 * @param props - Caption, columns, and row data mirroring the chart
 */
export function ChartDataTable({
  caption,
  columns,
  rows,
  className,
}: ChartDataTableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-lg border border-border", className)}>
      <Table>
        <caption className="sr-only">{caption}</caption>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={column.align === "right" ? "text-right" : undefined}
                scope="col"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`chart-row-${index}`}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={column.align === "right" ? "text-right tabular-nums" : undefined}
                >
                  {row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
