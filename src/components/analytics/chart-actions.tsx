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
import { cn } from "@/lib/utils";

interface ChartActionsProps {
  chartRef: React.RefObject<HTMLElement | null>;
  csvFilename: string;
  pngFilename: string;
  onExportCsv: () => void;
  onFullscreen: () => void;
}

interface ChartActionButtonProps {
  label: string;
  chipClassName: string;
  onClick: () => void;
  children: React.ReactNode;
}

function ChartActionButton({
  label,
  chipClassName,
  onClick,
  children,
}: ChartActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="retro-pill size-10 border-transparent p-0"
            aria-label={label}
            onClick={onClick}
          />
        }
      >
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-xl text-[var(--retro-chart-strong)]",
            chipClassName,
          )}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** Icon toolbar for chart export and fullscreen actions. */
export function ChartActions({
  chartRef,
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
    <div className="flex items-center gap-1.5">
      <ChartActionButton
        label="Export CSV"
        chipClassName="bg-[var(--retro-mint)]"
        onClick={onExportCsv}
      >
        <FileSpreadsheet aria-hidden="true" className="size-4" />
      </ChartActionButton>
      <ChartActionButton
        label="Export PNG"
        chipClassName="bg-[var(--retro-pink)]"
        onClick={() => void handlePngExport()}
      >
        <Download aria-hidden="true" className="size-4" />
      </ChartActionButton>
      <ChartActionButton
        label="Full screen"
        chipClassName="bg-[var(--retro-blue)]"
        onClick={onFullscreen}
      >
        <Expand aria-hidden="true" className="size-4" />
      </ChartActionButton>
    </div>
  );
}
