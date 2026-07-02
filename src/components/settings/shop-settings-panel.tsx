"use client";

import { Store } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/hooks/use-settings";
import { useShops } from "@/hooks/use-shops";
import { GATEWAY_ENVIRONMENT_LABELS } from "@/lib/settings-labels";
import { formatRelativeTime } from "@/lib/format";
import { useHealth } from "@/hooks/use-health";

interface ShopSettingsPanelProps {
  shopId: string;
}

interface InfoRowProps {
  label: string;
  value: ReactNode;
}

/** Label/value row for shop metadata. */
function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="retro-info-row flex flex-col gap-1 border-b py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

/** Shop metadata, gateway status, and application version. */
export function ShopSettingsPanel({ shopId }: ShopSettingsPanelProps) {
  const shopsQuery = useShops(true);
  const settingsQuery = useSettings(shopId);
  const healthQuery = useHealth();

  const shop = shopsQuery.data?.find((entry) => entry.id === shopId);
  const gateway = settingsQuery.data?.gateway;
  const isLoading = shopsQuery.isLoading || settingsQuery.isLoading;

  if (isLoading) {
    return <Skeleton className="retro-panel h-64 w-full rounded-[1.5rem]" />;
  }

  if (!shop) {
    return (
      <EmptyState
        icon={Store}
        title="Shop not found"
        description="Unable to load shop details for this workspace."
      />
    );
  }

  const environment = gateway?.environment;
  const appVersion = healthQuery.data?.version ?? "—";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shop settings</CardTitle>
        <CardDescription>
          Workspace details and integration status for this store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl>
          <InfoRow label="Shop name" value={shop.shopName} />
          <InfoRow label="Shop domain" value={shop.shopDomain} />
          <InfoRow label="Currency" value={shop.currency} />
          <InfoRow
            label="Status"
            value={
              <StatusBadge
                label={shop.isActive ? "Active" : "Inactive"}
                variant={shop.isActive ? "success" : "neutral"}
              />
            }
          />
          <InfoRow
            label="Current environment"
            value={
              environment ? (
                GATEWAY_ENVIRONMENT_LABELS[environment]
              ) : (
                <StatusBadge label="Not configured" variant="neutral" />
              )
            }
          />
          <InfoRow
            label="Connected gateway"
            value={
              gateway ? (
                <StatusBadge label={gateway.provider} variant="success" />
              ) : (
                <StatusBadge label="Not connected" variant="warning" />
              )
            }
          />
          <InfoRow
            label="Last synchronization"
            value={
              healthQuery.data?.timestamp
                ? formatRelativeTime(healthQuery.data.timestamp)
                : "—"
            }
          />
          <InfoRow label="App version" value={appVersion} />
        </dl>
      </CardContent>
    </Card>
  );
}
