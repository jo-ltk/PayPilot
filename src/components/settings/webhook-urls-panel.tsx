"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ValidateResponse } from "@/schemas/settings.schema";

interface WebhookUrlsPanelProps {
  webhookUrls: ValidateResponse["webhookUrls"] | null;
}

/**
 * Copies a webhook URL to the clipboard.
 * @param label - Field label for toast messaging
 * @param value - URL to copy
 */
async function copyWebhookUrl(label: string, value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Unable to copy to clipboard");
  }
}

const WEBHOOK_FIELDS: Array<{
  key: keyof ValidateResponse["webhookUrls"];
  label: string;
}> = [
  { key: "transaction", label: "Transaction webhook" },
  { key: "payout", label: "Payout webhook" },
  { key: "refund", label: "Refund webhook" },
];

/** Read-only Easebuzz webhook URLs returned after credential validation. */
export function WebhookUrlsPanel({ webhookUrls }: WebhookUrlsPanelProps) {
  if (!webhookUrls) {
    return null;
  }

  return (
    <div className="retro-subpanel space-y-4 p-4 sm:p-5">
      <div className="space-y-1">
        <h3 className="font-retro text-base font-medium text-foreground">
          Webhook URLs
        </h3>
        <p className="text-sm text-muted-foreground">
          Copy these into your Easebuzz dashboard after a successful connection
          test.
        </p>
      </div>
      <div className="space-y-3">
        {WEBHOOK_FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`webhook-${key}`}>{label}</Label>
            <div className="flex gap-2">
              <Input
                id={`webhook-${key}`}
                readOnly
                value={webhookUrls[key]}
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="retro-pill shrink-0 border-transparent"
                aria-label={`Copy ${label}`}
                onClick={() => void copyWebhookUrl(label, webhookUrls[key])}
              >
                <Copy aria-hidden="true" className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
