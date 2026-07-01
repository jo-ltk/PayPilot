import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton placeholder for a single KPI card. */
export function KpiCardSkeleton() {
  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader className="gap-1 pb-2">
        <CardDescription>
          <Skeleton className="h-3 w-24" />
        </CardDescription>
        <Skeleton className="h-8 w-32" />
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}
