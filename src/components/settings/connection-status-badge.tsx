import { StatusBadge, type StatusVariant } from "@/components/shared/status-badge";

export type ConnectionState = "unknown" | "connected" | "failed" | "testing";

interface ConnectionStatusBadgeProps {
  state: ConnectionState;
}

const STATE_LABELS: Record<ConnectionState, string> = {
  unknown: "Not tested",
  connected: "Connected",
  failed: "Connection failed",
  testing: "Testing…",
};

const STATE_VARIANTS: Record<ConnectionState, StatusVariant> = {
  unknown: "neutral",
  connected: "success",
  failed: "error",
  testing: "pending",
};

/** Displays gateway connection validation status. */
export function ConnectionStatusBadge({ state }: ConnectionStatusBadgeProps) {
  return (
    <StatusBadge
      label={STATE_LABELS[state]}
      variant={STATE_VARIANTS[state]}
    />
  );
}
