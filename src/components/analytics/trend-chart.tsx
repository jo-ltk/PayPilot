"use client";

import { motion, useReducedMotion } from "framer-motion";
import { memo, useCallback, useRef, useState, type ReactNode } from "react";

import { ChartActions } from "@/components/analytics/chart-actions";
import { ChartShell } from "@/components/dashboard/chart-shell";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { chartFadeVariants, reducedMotionTransition } from "@/lib/animations";
import { buildCsv, downloadCsv } from "@/lib/export-csv";
import { cn } from "@/lib/utils";

interface TrendChartProps {
  title: string;
  description: string;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isEmpty: boolean;
  onRetry?: () => void;
  csvFilename: string;
  pngFilename: string;
  csvRows: Record<string, string | number>[];
  csvColumns: { header: string; key: string }[];
  children: ReactNode;
}

/** Analytics chart card with export, fullscreen, and state handling. */
export const TrendChart = memo(function TrendChart({
  title,
  description,
  isLoading,
  isError,
  errorMessage,
  isEmpty,
  onRetry,
  csvFilename,
  pngFilename,
  csvRows,
  csvColumns,
  children,
}: TrendChartProps) {
  const prefersReducedMotion = useReducedMotion();
  const chartRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const handleExportCsv = useCallback(() => {
    const content = buildCsv(
      csvRows,
      csvColumns.map((column) => ({
        header: column.header,
        value: (row) => row[column.key],
      })),
    );
    downloadCsv(csvFilename, content);
  }, [csvColumns, csvFilename, csvRows]);

  const chartBody = (
    <motion.div
      ref={chartRef}
      initial="hidden"
      animate="visible"
      variants={chartFadeVariants}
      transition={prefersReducedMotion ? reducedMotionTransition : undefined}
    >
      {children}
    </motion.div>
  );

  const tableColumns = csvColumns.map((column) => ({
    header: column.header,
    key: column.key,
    align: typeof csvRows[0]?.[column.key] === "number" ? ("right" as const) : undefined,
  }));

  if (isLoading) {
    return (
      <ChartShell
        title={title}
        description={description}
        isLoading
        isError={false}
        isEmpty={false}
      >
        {null}
      </ChartShell>
    );
  }

  return (
    <>
      <ChartShell
        title={title}
        description={description}
        isLoading={false}
        isError={isError}
        errorMessage={errorMessage}
        isEmpty={isEmpty}
        onRetry={onRetry}
        tableCaption={`${title} data table`}
        tableColumns={tableColumns}
        tableRows={csvRows}
      >
        <div className="space-y-2">
          <div className="flex justify-end">
            <ChartActions
              chartRef={chartRef}
              csvFilename={csvFilename}
              pngFilename={pngFilename}
              onExportCsv={handleExportCsv}
              onFullscreen={() => setFullscreen(true)}
            />
          </div>
          {chartBody}
        </div>
      </ChartShell>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent
          className={cn(
            "gap-3 p-4",
            "top-[max(0.75rem,env(safe-area-inset-top))] max-h-[calc(100dvh-1.5rem)] translate-y-0 overflow-y-auto",
            "sm:top-1/2 sm:max-w-5xl sm:-translate-y-1/2",
          )}
        >
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="h-64 w-full min-w-0 sm:h-[28rem]">{chartBody}</div>
        </DialogContent>
      </Dialog>
    </>
  );
});

/** Lazy-loaded inner chart placeholder for dynamic imports. */
export const LazyChartFallback = memo(function LazyChartFallback() {
  return <LoadingSkeleton variant="chart" />;
});
