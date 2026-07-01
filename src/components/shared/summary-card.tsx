import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/** Grouped summary card for detail panels and sidebars. */
export function SummaryCard({
  title,
  description,
  children,
  footer,
  className,
}: SummaryCardProps) {
  return (
    <Card className={cn("border-border/80 shadow-none", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? (
        <div className="border-t bg-muted/50 px-4 py-3">{footer}</div>
      ) : null}
    </Card>
  );
}
