"use client";

import { GatewayEnvironment } from "@prisma/client";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Plug, Save } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  ConnectionStatusBadge,
  type ConnectionState,
} from "@/components/settings/connection-status-badge";
import { MatchingStrategyFields } from "@/components/settings/matching-strategy-fields";
import { WebhookUrlsPanel } from "@/components/settings/webhook-urls-panel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useValidateSettings } from "@/hooks/use-validate-settings";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { saveSuccessVariants, reducedMotionTransition } from "@/lib/animations";
import { GATEWAY_ENVIRONMENT_LABELS } from "@/lib/settings-labels";
import {
  buildSettingsPatch,
  hasUnsavedSettings,
  maskedSecretHints,
  settingsToFormValues,
  validateGatewaySave,
  type SettingsFormValues,
} from "@/lib/settings-form";
import { canEditSettings } from "@/lib/settings-permissions";
import { useShopContext } from "@/hooks/use-shop-context";
import type { ValidateResponse } from "@/schemas/settings.schema";

interface GatewaySettingsFormProps {
  shopId: string;
}

/** Gateway credentials, environment, and matching strategy form. */
export const GatewaySettingsForm = memo(function GatewaySettingsForm({
  shopId,
}: GatewaySettingsFormProps) {
  const { mode, role } = useShopContext();
  const editable = canEditSettings(mode, role);
  const prefersReducedMotion = useReducedMotion();

  const settingsQuery = useSettings(shopId);
  const updateMutation = useUpdateSettings(shopId);
  const validateMutation = useValidateSettings(shopId);

  const [values, setValues] = useState<SettingsFormValues>(() =>
    settingsToFormValues(undefined),
  );
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("unknown");
  const [webhookUrls, setWebhookUrls] =
    useState<ValidateResponse["webhookUrls"] | null>(null);
  const [savePulse, setSavePulse] = useState<"idle" | "saved">("idle");

  const baseline = settingsQuery.data;
  const hints = useMemo(() => maskedSecretHints(baseline?.gateway), [baseline]);

  useEffect(() => {
    if (baseline) {
      setValues(settingsToFormValues(baseline));
    }
  }, [baseline]);

  const isDirty = hasUnsavedSettings(values, baseline);
  useUnsavedChanges(isDirty);

  const patchValues = useCallback(
    (patch: Partial<SettingsFormValues>) => {
      setValues((current) => ({ ...current, ...patch }));
    },
    [],
  );

  const handleSave = async () => {
    const includeGateway =
      values.merchantKey.length > 0 || values.merchantSalt.length > 0;
    const initial = settingsToFormValues(baseline);
    const gatewayMetaDirty =
      values.merchantEmail !== initial.merchantEmail ||
      values.environment !== initial.environment;

    if (gatewayMetaDirty && !includeGateway) {
      toast.error(
        "Re-enter merchant key and salt to update gateway email or environment",
      );
      return;
    }

    const validationError = validateGatewaySave(values, includeGateway);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    const patch = buildSettingsPatch(values, baseline?.matching, includeGateway);

    if (!patch.gateway && !patch.matching) {
      toast.info("No changes to save");
      return;
    }

    try {
      const result = await updateMutation.mutateAsync(patch);
      setValues(settingsToFormValues(result));
      setSavePulse("saved");
      window.setTimeout(() => setSavePulse("idle"), 600);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save settings",
      );
    }
  };

  const handleTestConnection = async () => {
    setConnectionState("testing");

    try {
      const result = await validateMutation.mutateAsync();
      setWebhookUrls(result.webhookUrls);
      setConnectionState(result.valid ? "connected" : "failed");

      if (result.valid) {
        toast.success(result.message ?? "Connection successful");
      } else {
        toast.error(result.message ?? "Connection failed");
      }
    } catch (error) {
      setConnectionState("failed");
      toast.error(
        error instanceof Error ? error.message : "Connection test failed",
      );
    }
  };

  const isSaving = updateMutation.isPending;
  const isTesting = validateMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Gateway settings</CardTitle>
            <CardDescription>
              Configure Easebuzz credentials and reconciliation matching.
            </CardDescription>
          </div>
          <ConnectionStatusBadge state={connectionState} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gateway-name">Gateway name</Label>
            <Input
              id="gateway-name"
              readOnly
              value={values.provider}
              className="bg-muted/40"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="merchant-email">Merchant email</Label>
            <Input
              id="merchant-email"
              type="email"
              autoComplete="off"
              disabled={!editable || isSaving}
              value={values.merchantEmail}
              onChange={(event) =>
                patchValues({ merchantEmail: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="merchant-key">Merchant key</Label>
            <Input
              id="merchant-key"
              type="password"
              autoComplete="new-password"
              disabled={!editable || isSaving}
              placeholder={hints.keyHint}
              value={values.merchantKey}
              onChange={(event) =>
                patchValues({ merchantKey: event.target.value })
              }
              aria-describedby="merchant-key-hint"
            />
            <p id="merchant-key-hint" className="text-xs text-muted-foreground">
              Stored value: {hints.keyHint}. Leave blank to keep unchanged.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="merchant-salt">Merchant salt</Label>
            <Input
              id="merchant-salt"
              type="password"
              autoComplete="new-password"
              disabled={!editable || isSaving}
              placeholder={hints.saltHint}
              value={values.merchantSalt}
              onChange={(event) =>
                patchValues({ merchantSalt: event.target.value })
              }
              aria-describedby="merchant-salt-hint"
            />
            <p
              id="merchant-salt-hint"
              className="text-xs text-muted-foreground"
            >
              Stored value: {hints.saltHint}. Leave blank to keep unchanged.
            </p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="gateway-environment">Environment</Label>
            <Select
              value={values.environment}
              onValueChange={(environment) =>
                patchValues({
                  environment: environment as GatewayEnvironment,
                })
              }
              disabled={!editable || isSaving}
            >
              <SelectTrigger id="gateway-environment" className="w-full md:w-64">
                <SelectValue placeholder="Select environment" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(GatewayEnvironment).map((environment) => (
                  <SelectItem key={environment} value={environment}>
                    {GATEWAY_ENVIRONMENT_LABELS[environment]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="retro-subpanel space-y-4 p-4 sm:p-5">
          <div className="space-y-1">
            <h3 className="font-retro text-base font-medium text-foreground">
              Matching strategy
            </h3>
            <p className="text-sm text-muted-foreground">
              How payments are matched to orders during reconciliation.
            </p>
          </div>
          <MatchingStrategyFields
            values={values}
            disabled={!editable || isSaving}
            onChange={patchValues}
          />
        </div>

        <WebhookUrlsPanel webhookUrls={webhookUrls} />
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 sm:flex sm:flex-nowrap sm:items-center sm:justify-start">
        <motion.div
          variants={saveSuccessVariants}
          animate={savePulse}
          transition={prefersReducedMotion ? reducedMotionTransition : undefined}
          className="min-w-0"
        >
          <Button
            type="button"
            className="retro-primary-pill h-11 w-full gap-2 border-transparent px-2.5 sm:w-auto sm:gap-2.5 sm:pl-1.5 sm:pr-4"
            disabled={!editable || isSaving || !isDirty}
            onClick={() => void handleSave()}
          >
            {isSaving ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin" />
                <span className="truncate font-retro text-xs font-medium sm:text-sm">
                  Saving…
                </span>
              </>
            ) : (
              <>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-white/25 text-current sm:size-8">
                  <Save aria-hidden="true" className="size-3.5 sm:size-4" />
                </span>
                <span className="truncate font-retro text-xs font-medium sm:text-sm">
                  Save changes
                </span>
              </>
            )}
          </Button>
        </motion.div>
        <Button
          type="button"
          variant="outline"
          className="retro-pill h-11 w-full min-w-0 gap-2 border-transparent px-2.5 sm:w-auto sm:gap-2.5 sm:pl-1.5 sm:pr-4"
          disabled={!editable || isTesting}
          onClick={() => void handleTestConnection()}
        >
          {isTesting ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin" />
              <span className="truncate font-retro text-xs font-medium text-foreground sm:text-sm">
                Testing…
              </span>
            </>
          ) : (
            <>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-[var(--retro-mint)] text-[var(--retro-chart-strong)] sm:size-8">
                <Plug aria-hidden="true" className="size-3.5 sm:size-4" />
              </span>
              <span className="truncate font-retro text-xs font-medium text-foreground sm:text-sm">
                Test connection
              </span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
});
