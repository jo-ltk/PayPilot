"use client";

import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { cn } from "@/lib/utils";

interface DetailFieldProps {
  label: string;
  value: string;
  copyable?: boolean;
  className?: string;
}

/** Label/value row for entity detail drawers. */
export function DetailField({
  label,
  value,
  copyable = false,
  className,
}: DetailFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="flex items-center gap-2 text-sm text-foreground">
        <span className="break-all">{value}</span>
        {copyable && value !== "—" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Copy ${label}`}
            onClick={() => void copyToClipboard(value, label)}
          >
            <Copy aria-hidden="true" className="size-3.5" />
          </Button>
        ) : null}
      </dd>
    </div>
  );
}
