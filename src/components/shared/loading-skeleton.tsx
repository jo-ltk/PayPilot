import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "table" | "chart" | "page";
  rows?: number;
  className?: string;
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-xl border border-border bg-card p-6",
        className,
      )}
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-6">
      <Skeleton className="h-4 w-40" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={`row-${index}`} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6",
        className,
      )}
    >
      <Skeleton className="mb-4 h-4 w-36" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={`kpi-${index}`} />
        ))}
      </div>
    </div>
  );
}

/** Reusable loading skeletons for cards, tables, charts, and pages. */
export function LoadingSkeleton({
  variant = "card",
  rows = 10,
  className,
}: LoadingSkeletonProps) {
  if (variant === "page") {
    return <PageSkeleton />;
  }

  if (variant === "table") {
    return <TableSkeleton rows={rows} />;
  }

  if (variant === "chart") {
    return <ChartSkeleton className={className} />;
  }

  return <CardSkeleton className={className} />;
}
