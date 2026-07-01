import type { LucideIcon } from "lucide-react";
import { TableProperties } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

interface DataTableEmptyProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Empty state tailored for data tables with no rows. */
export function DataTableEmpty({
  icon: Icon = TableProperties,
  title = "No results found",
  description = "Try adjusting your search or filters.",
  actionLabel,
  onAction,
  className,
}: DataTableEmptyProps) {
  return (
    <EmptyState
      icon={Icon}
      title={title}
      description={description}
      actionLabel={actionLabel}
      onAction={onAction}
      className={cn("rounded-xl", className)}
    />
  );
}
