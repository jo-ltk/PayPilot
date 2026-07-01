"use client";

import { WifiOff } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { reducedMotionTransition } from "@/lib/animations";

/** Sticky banner for offline detection and reconnect feedback. */
export function NetworkStatusBanner() {
  const { status, wasOffline, clearReconnect } = useNetworkStatus();
  const prefersReducedMotion = useReducedMotion();

  if (status === "online" && !wasOffline) {
    return null;
  }

  if (status === "offline") {
    return (
      <motion.div
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? reducedMotionTransition : undefined}
        className="sticky top-0 z-30 border-b border-warning/30 bg-warning/10 px-4 py-2"
      >
        <Alert variant="default" className="border-warning/40 bg-transparent py-2">
          <WifiOff aria-hidden="true" className="text-warning" />
          <AlertTitle>You are offline</AlertTitle>
          <AlertDescription>
            Changes will not sync until your connection is restored.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? reducedMotionTransition : undefined}
      className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-success/30 bg-success/10 px-4 py-2 text-sm"
    >
      <span className="text-success-foreground">Back online — data will refresh automatically.</span>
      <Button type="button" variant="ghost" size="sm" onClick={clearReconnect}>
        Dismiss
      </Button>
    </motion.div>
  );
}
