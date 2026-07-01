"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  Scale,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ActivityItem } from "@/hooks/use-dashboard-activity";
import {
  listItemVariants,
  listStaggerVariants,
  reducedMotionTransition,
} from "@/lib/animations";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  items?: ActivityItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

const activityIcons: Record<ActivityItem["type"], LucideIcon> = {
  payment: ArrowLeftRight,
  settlement: CheckCircle2,
  refund: RotateCcw,
  reconciliation: Scale,
};

const activityStyles: Record<ActivityItem["type"], string> = {
  payment: "text-foreground",
  settlement: "text-success",
  refund: "text-muted-foreground",
  reconciliation: "text-warning",
};

/** Timeline of recent payments, settlements, refunds, and reconciliation. */
export function RecentActivity({
  items,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: RecentActivityProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Card className="border-border/80 shadow-none">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest payments, settlements, refunds, and reconciliation updates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? <LoadingSkeleton variant="table" rows={4} /> : null}
        {!isLoading && isError ? (
          <ErrorState
            title="Activity unavailable"
            message={errorMessage ?? "Failed to load recent activity"}
            onRetry={onRetry}
          />
        ) : null}
        {!isLoading && !isError && (!items || items.length === 0) ? (
          <EmptyState
            icon={Clock}
            title="No recent activity"
            description="Transactions and settlements will show up here as they happen."
          />
        ) : null}
        {!isLoading && !isError && items && items.length > 0 ? (
          <motion.ol
            className="relative space-y-0"
            initial="hidden"
            animate="visible"
            variants={listStaggerVariants}
            transition={prefersReducedMotion ? reducedMotionTransition : undefined}
          >
            {items.map((item, index) => {
              const Icon = activityIcons[item.type];
              const isLast = index === items.length - 1;

              return (
                <motion.li
                  key={item.id}
                  className="relative flex gap-4 pb-6 last:pb-0"
                  variants={listItemVariants}
                  transition={
                    prefersReducedMotion ? reducedMotionTransition : undefined
                  }
                >
                  {!isLast ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-[17px] top-9 h-[calc(100%-1.25rem)] w-px bg-border"
                    />
                  ) : null}
                  <div
                    className={cn(
                      "relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-background",
                      activityStyles[item.type],
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeTime(item.timestamp)}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </motion.ol>
        ) : null}
      </CardContent>
    </Card>
  );
}
