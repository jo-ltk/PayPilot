import { EventSchemas, Inngest } from "inngest";

/** Typed Inngest event map for SettleFlow background jobs. */
export type SettleFlowEvents = {
  "shopify/sync.requested": {
    data: { shopId: string; shopDomain: string; since?: string };
  };
  "shopify/webhook.received": {
    data: { webhookEventId: string };
  };
  "easebuzz/webhook.received": {
    data: { webhookEventId: string };
  };
  "reconciliation/run": {
    data: { shopId: string };
  };
};

/** Shared Inngest client for emitting events and registering functions. */
export const inngest = new Inngest({
  id: "settleflow",
  schemas: new EventSchemas().fromRecord<SettleFlowEvents>(),
});
