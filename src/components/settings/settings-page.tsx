"use client";

import { useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { CreditCard, Shield, Store, Users } from "lucide-react";
import { useCallback, type ReactNode } from "react";

import { GatewaySettingsForm } from "@/components/settings/gateway-settings-form";
import { SecurityPanel } from "@/components/settings/security-panel";
import { SettingsTabPanel } from "@/components/settings/settings-tab-panel";
import { ShopSettingsPanel } from "@/components/settings/shop-settings-panel";
import { TeamManagementPanel } from "@/components/settings/team-management-panel";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { useShopContext } from "@/hooks/use-shop-context";
import { filterToolbarVariants, reducedMotionTransition } from "@/lib/animations";
import { queryKeys } from "@/lib/query-keys";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  { value: "gateway", label: "Gateway", icon: CreditCard, chip: "bg-[var(--retro-blue)]" },
  { value: "team", label: "Team", icon: Users, chip: "bg-[var(--retro-mint)]" },
  { value: "shop", label: "Shop", icon: Store, chip: "bg-[var(--retro-yellow)]" },
  { value: "security", label: "Security", icon: Shield, chip: "bg-[var(--retro-pink)]" },
] as const;

interface SettingsPageShellProps {
  children: ReactNode;
}

/** Retro-styled page shell shared by loading, error, and main states. */
function SettingsPageShell({ children }: SettingsPageShellProps) {
  return (
    <div className="retro-dash -mx-4 -my-6 min-h-full space-y-8 px-4 py-8 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <header className="max-w-4xl space-y-3">
        <h1 className="font-retro text-4xl font-medium leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Configure gateway credentials, matching, and team access.
        </p>
      </header>
      {children}
    </div>
  );
}

/** Shared settings page with gateway, team, shop, and security sections. */
export function SettingsPage() {
  const queryClient = useQueryClient();
  const { shopId } = useShopContext();
  const settingsQuery = useSettings(shopId);
  const prefersReducedMotion = useReducedMotion();

  const refresh = useCallback(() => {
    if (!shopId) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ["shop", shopId, "settings"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.health() });
  }, [queryClient, shopId]);

  if (!shopId) {
    return (
      <SettingsPageShell>
        <LoadingSkeleton className="retro-panel h-48 w-full p-6" />
      </SettingsPageShell>
    );
  }

  if (settingsQuery.isError) {
    return (
      <SettingsPageShell>
        <ErrorState
          message={settingsQuery.error?.message ?? "Failed to load settings"}
          onRetry={refresh}
        />
      </SettingsPageShell>
    );
  }

  return (
    <SettingsPageShell>
      <Tabs defaultValue="gateway" className="space-y-6">
        <motion.div
          variants={filterToolbarVariants}
          initial="hidden"
          animate="visible"
          transition={prefersReducedMotion ? reducedMotionTransition : undefined}
          className="retro-panel px-3 py-3 sm:px-4"
        >
          <TabsList
            variant="default"
            className="retro-settings-tabs grid h-auto! w-full grid-cols-2 gap-2 bg-transparent p-0 sm:flex sm:flex-row"
          >
            {SETTINGS_TABS.map(({ value, label, icon: Icon, chip }) => (
              <TabsTrigger
                key={value}
                value={value}
                className={cn(
                  "retro-settings-tab h-auto min-h-11 flex-none gap-2 px-3 py-2.5",
                  "after:hidden focus-visible:ring-2 focus-visible:ring-ring/25",
                  "sm:flex-1 sm:justify-center",
                  "data-active:bg-[var(--retro-chip)] data-active:text-[var(--retro-chip-foreground)]",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--retro-chart-strong)] sm:size-8 sm:rounded-xl",
                    chip,
                  )}
                >
                  <Icon aria-hidden="true" className="size-3.5 sm:size-4" />
                </span>
                <span className="font-retro text-sm font-medium">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </motion.div>

        <TabsContent value="gateway">
          <SettingsTabPanel>
            {settingsQuery.isLoading ? (
              <LoadingSkeleton className="retro-panel h-96 w-full p-6" />
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
    </SettingsPageShell>
  );
}
