import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}

/** Compact metric display card for analytics sections. */
export function MetricCard({ label, value, hint, className }: MetricCardProps) {
  return (
    <Card size="sm" className={cn("border-border/80 shadow-none", className)}>
      <CardHeader className="gap-0.5 pb-1">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-lg font-semibold">{value}</CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
