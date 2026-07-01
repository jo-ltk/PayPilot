import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: LucideIcon;
  className?: string;
}

const trendStyles = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-muted-foreground",
} as const;

/** Dashboard KPI card with optional trend indicator. */
export function KpiCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  className,
}: KpiCardProps) {
  const TrendIcon =
    trend?.direction === "down" ? TrendingDown : TrendingUp;

  return (
    <Card className={cn("border-border/80 shadow-none", className)}>
      <CardHeader className="gap-1 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardDescription>{title}</CardDescription>
          {Icon ? (
            <Icon
              aria-hidden="true"
              className="size-4 text-muted-foreground"
            />
          ) : null}
        </div>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {value}
        </CardTitle>
      </CardHeader>
      {(description || trend) && (
        <CardContent className="flex items-center gap-2 pt-0">
          {trend ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                trendStyles[trend.direction],
              )}
            >
              {trend.direction !== "neutral" ? (
                <TrendIcon aria-hidden="true" className="size-3" />
              ) : null}
              {trend.value}
            </span>
          ) : null}
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </CardContent>
      )}
    </Card>
  );
}
