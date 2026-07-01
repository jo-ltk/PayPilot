"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { GatewaySettingsForm } from "@/components/settings/gateway-settings-form";
import { SecurityPanel } from "@/components/settings/security-panel";
import { SettingsTabPanel } from "@/components/settings/settings-tab-panel";
import { ShopSettingsPanel } from "@/components/settings/shop-settings-panel";
import { TeamManagementPanel } from "@/components/settings/team-management-panel";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageTransition } from "@/components/shared/page-transition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { useShopContext } from "@/hooks/use-shop-context";
import { queryKeys } from "@/lib/query-keys";

/** Shared settings page with gateway, team, shop, and security sections. */
export function SettingsPage() {
  const queryClient = useQueryClient();
  const { shopId } = useShopContext();
  const settingsQuery = useSettings(shopId);

  const refresh = useCallback(() => {
    if (!shopId) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ["shop", shopId, "settings"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.health() });
  }, [queryClient, shopId]);

  if (!shopId) {
    return (
      <PageTransition className="space-y-6">
        <PageHeader
          title="Settings"
          description="Configure gateway credentials, matching, and team access."
        />
        <LoadingSkeleton className="h-48 w-full" />
      </PageTransition>
    );
  }

  if (settingsQuery.isError) {
    return (
      <PageTransition className="space-y-6">
        <PageHeader
          title="Settings"
          description="Configure gateway credentials, matching, and team access."
        />
        <ErrorState
          message={settingsQuery.error?.message ?? "Failed to load settings"}
          onRetry={refresh}
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure gateway credentials, matching, and team access."
      />

      <Tabs defaultValue="gateway" className="space-y-6">
        <TabsList
          variant="line"
          className="h-auto w-full justify-start overflow-x-auto"
        >
          <TabsTrigger value="gateway">Gateway</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="shop">Shop</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="gateway">
          <SettingsTabPanel>
            {settingsQuery.isLoading ? (
              <LoadingSkeleton className="h-96 w-full rounded-xl" />
            ) : (
              <GatewaySettingsForm shopId={shopId} />
            )}
          </SettingsTabPanel>
        </TabsContent>

        <TabsContent value="team">
          <SettingsTabPanel>
            <TeamManagementPanel shopId={shopId} />
          </SettingsTabPanel>
        </TabsContent>

        <TabsContent value="shop">
          <SettingsTabPanel>
            <ShopSettingsPanel shopId={shopId} />
          </SettingsTabPanel>
        </TabsContent>

        <TabsContent value="security">
          <SettingsTabPanel>
            <SecurityPanel />
          </SettingsTabPanel>
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}
