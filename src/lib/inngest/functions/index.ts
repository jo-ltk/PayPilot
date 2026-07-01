import { processEasebuzzWebhookFn } from "./process-easebuzz-webhook";
import { processShopifyWebhookFn } from "./process-shopify-webhook";
import {
  nightlyReconciliationFn,
  runReconciliationFn,
} from "./run-reconciliation";
import { syncShopifyOrdersFn } from "./sync-shopify-orders";

/** All Inngest functions registered with the serve handler. */
export const functions = [
  processShopifyWebhookFn,
  processEasebuzzWebhookFn,
  runReconciliationFn,
  nightlyReconciliationFn,
  syncShopifyOrdersFn,
];
