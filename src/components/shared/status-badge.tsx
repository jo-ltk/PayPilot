import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  MinusCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusVariant =
  | "success"
  | "warning"
  | "error"
  | "neutral"
  | "pending";

interface StatusBadgeProps {
  label: string;
  variant: StatusVariant;
  className?: string;
}

const statusStyles: Record<StatusVariant, string> = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  neutral: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/10 text-warning border-warning/20",
};

const statusIcons: Record<StatusVariant, LucideIcon> = {
  success: CheckCircle2,
  warning: Clock3,
  error: AlertCircle,
  neutral: MinusCircle,
  pending: CircleDashed,
};

/** Semantic status badge with icon and text for accessibility. */
export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  const Icon = statusIcons[variant];

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-medium", statusStyles[variant], className)}
    >
      <Icon aria-hidden="true" className="size-3" />
      <span>{label}</span>
    </Badge>
  );
}
