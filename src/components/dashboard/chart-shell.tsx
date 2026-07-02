"use client";

import { BarChart3, TableIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { ChartDataTable, type ChartDataColumn } from "@/components/shared/chart-data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChartShellProps {
  title: string;
  description: string;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isEmpty: boolean;
  onRetry?: () => void;
  tableCaption?: string;
  tableColumns?: ChartDataColumn[];
  tableRows?: Record<string, string | number>[];
  children: ReactNode;
}

/** Shared chart card with loading, empty, error, and table view states. */
export function ChartShell({
  title,
  description,
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  onRetry,
  tableCaption,
  tableColumns,
  tableRows,
  children,
}: ChartShellProps) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const hasTable = Boolean(tableColumns?.length && tableRows?.length);

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {hasTable && !isLoading && !isError && !isEmpty ? (
          <div
            className="flex shrink-0 items-center gap-1 rounded-full border border-foreground/15 p-1"
            role="group"
            aria-label="Chart view mode"
          >
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant={view === "chart" ? "secondary" : "ghost"}
                    size="icon-sm"
                    className="rounded-full"
                    aria-label="Chart view"
                    aria-pressed={view === "chart"}
                    onClick={() => setView("chart")}
                  />
                }
              >
                <BarChart3 aria-hidden="true" className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Chart view</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant={view === "table" ? "secondary" : "ghost"}
                    size="icon-sm"
                    className="rounded-full"
                    aria-label="Table view"
                    aria-pressed={view === "table"}
                    onClick={() => setView("table")}
                  />
                }
              >
                <TableIcon aria-hidden="true" className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Table view</TooltipContent>
            </Tooltip>
          </div>
        ) : null}
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingSkeleton variant="chart" /> : null}
        {!isLoading && isError ? (
          <ErrorState
            title="Chart unavailable"
            message={errorMessage ?? "Failed to load chart data"}
            onRetry={onRetry}
          />
        ) : null}
        {!isLoading && !isError && isEmpty ? (
          <EmptyState
            icon={BarChart3}
            title="No data yet"
            description="Activity in this period will appear here."
          />
        ) : null}
        {!isLoading && !isError && !isEmpty ? (
          view === "table" && hasTable ? (
            <ChartDataTable
              caption={tableCaption ?? `${title} data table`}
              columns={tableColumns!}
              rows={tableRows!}
            />
          ) : (
            children
          )
        ) : null}
      </CardContent>
    </Card>
  );
}
