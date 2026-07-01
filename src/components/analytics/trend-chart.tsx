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
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="h-[28rem] w-full">{chartBody}</div>
        </DialogContent>
      </Dialog>
    </>
  );
});

/** Lazy-loaded inner chart placeholder for dynamic imports. */
export const LazyChartFallback = memo(function LazyChartFallback() {
  return <LoadingSkeleton variant="chart" />;
});
