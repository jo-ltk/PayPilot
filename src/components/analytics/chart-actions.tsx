"use client";

import { Download, Expand, FileSpreadsheet } from "lucide-react";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { downloadChartPng } from "@/lib/export-png";

interface ChartActionsProps {
  chartRef: React.RefObject<HTMLElement | null>;
  csvFilename: string;
  pngFilename: string;
  onExportCsv: () => void;
  onFullscreen: () => void;
}

/** Icon toolbar for chart export and fullscreen actions. */
export function ChartActions({
  chartRef,
  csvFilename,
  pngFilename,
  onExportCsv,
  onFullscreen,
}: ChartActionsProps) {
  const handlePngExport = useCallback(async () => {
    if (!chartRef.current) {
      return;
    }

    try {
      await downloadChartPng(chartRef.current, pngFilename);
    } catch {
      return;
    }
  }, [chartRef, pngFilename]);

  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Export ${csvFilename} as CSV`}
              onClick={onExportCsv}
            />
          }
        >
          <FileSpreadsheet aria-hidden="true" className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Export CSV</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Export ${pngFilename} as PNG`}
              onClick={() => void handlePngExport()}
            />
          }
        >
          <Download aria-hidden="true" className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Export PNG</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Open chart in full screen"
              onClick={onFullscreen}
            />
          }
        >
          <Expand aria-hidden="true" className="size-4" />
        </TooltipTrigger>
        <TooltipContent>Full screen</TooltipContent>
      </Tooltip>
    </div>
  );
}
