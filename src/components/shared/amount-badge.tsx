import { ArrowDownLeft, ArrowUpRight, Minus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export type AmountDirection = "positive" | "negative" | "neutral";

interface AmountBadgeProps {
  paise: number;
  currency?: string;
  direction?: AmountDirection;
  className?: string;
}

const directionStyles: Record<AmountDirection, string> = {
  positive: "bg-success/10 text-success border-success/20",
  negative: "bg-destructive/10 text-destructive border-destructive/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

const directionIcons = {
  positive: ArrowUpRight,
  negative: ArrowDownLeft,
  neutral: Minus,
} as const;

/** Semantic amount badge with icon for credit/debit indication. */
export function AmountBadge({
  paise,
  currency = "INR",
  direction = "neutral",
  className,
}: AmountBadgeProps) {
  const Icon = directionIcons[direction];
  const formatted = formatCurrency(Math.abs(paise), currency);
  const prefix = direction === "negative" ? "−" : "";

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-medium tabular-nums", directionStyles[direction], className)}
    >
      <Icon aria-hidden="true" className="size-3" />
      <span>
        {prefix}
        {formatted}
      </span>
    </Badge>
  );
}
