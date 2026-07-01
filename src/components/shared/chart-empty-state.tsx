import { BarChart3 } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

interface ChartEmptyStateProps {
  title?: string;
  description?: string;
  className?: string;
}

/** Empty placeholder shown when chart data is unavailable. */
export function ChartEmptyState({
  title = "No chart data",
  description = "Data will appear here once transactions are synced.",
  className,
}: ChartEmptyStateProps) {
  return (
    <EmptyState
      icon={BarChart3}
      title={title}
      description={description}
      className={cn("border-none bg-transparent py-12", className)}
    />
  );
}
