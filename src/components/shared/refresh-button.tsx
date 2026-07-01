"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  onClick: () => void;
  isRefreshing?: boolean;
  label?: string;
  className?: string;
}

/** Accessible refresh action for data pages. */
export function RefreshButton({
  onClick,
  isRefreshing = false,
  label = "Refresh",
  className,
}: RefreshButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={label}
      disabled={isRefreshing}
      onClick={onClick}
      className={className}
    >
      <RefreshCw
        aria-hidden="true"
        className={cn("size-4", isRefreshing && "animate-spin")}
      />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}
