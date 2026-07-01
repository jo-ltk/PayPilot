"use client";

import { motion } from "framer-motion";

import { listItemVariants } from "@/lib/animations";
import { formatDate } from "@/lib/format";
import type { ReconciliationView } from "@/schemas/payments.schema";

type TimelineEvent = {
  id: string;
  label: string;
  timestamp: string;
  description?: string;
};

function buildTimelineEvents(record: ReconciliationView): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: "created",
      label: "Record created",
      timestamp: record.createdAt,
      description: record.reason ?? undefined,
    },
  ];

  if (record.resolvedAt) {
    events.push({
      id: "resolved",
      label: "Marked resolved",
      timestamp: record.resolvedAt,
      description: record.resolvedByUserId
        ? `By user ${record.resolvedByUserId}`
        : undefined,
    });
  }

  return events;
}

interface ReconciliationTimelineProps {
  record: ReconciliationView;
}

/** Vertical timeline for reconciliation record history. */
export function ReconciliationTimeline({ record }: ReconciliationTimelineProps) {
  const events = buildTimelineEvents(record);

  return (
    <ol className="space-y-4" aria-label="Reconciliation timeline">
      {events.map((event) => (
        <motion.li
          key={event.id}
          className="relative border-l border-border pl-4"
          variants={listItemVariants}
        >
          <span className="absolute -left-1 top-1 size-2 rounded-full bg-foreground" />
          <p className="text-sm font-medium">{event.label}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(event.timestamp, "dd MMM yyyy, HH:mm")}
          </p>
          {event.description ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {event.description}
            </p>
          ) : null}
        </motion.li>
      ))}
    </ol>
  );
}
