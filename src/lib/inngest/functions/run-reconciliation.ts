import { inngest } from "@/lib/inngest/client";
import { reportInngestFailure } from "@/lib/inngest/on-failure";
import { runReconciliation } from "@/lib/services/reconciliation.service";
import { listActiveShopIds } from "@/lib/services/shop.service";

/**
 * Runs reconciliation for a single shop in response to a `reconciliation/run`
 * event (emitted after processed webhooks and by manual triggers).
 */
export const runReconciliationFn = inngest.createFunction(
  { id: "run-reconciliation", retries: 3, onFailure: reportInngestFailure },
  { event: "reconciliation/run" },
  async ({ event }) => {
    const result = await runReconciliation(event.data.shopId);
    return { shopId: event.data.shopId, ...result };
  },
);

/**
 * Nightly cron (2am IST) that fans out reconciliation across active shops.
 */
export const nightlyReconciliationFn = inngest.createFunction(
  { id: "nightly-reconciliation", onFailure: reportInngestFailure },
  { cron: "TZ=Asia/Kolkata 0 2 * * *" },
  async () => {
    const shopIds = await listActiveShopIds();
    await Promise.all(
      shopIds.map((shopId) =>
        inngest.send({ name: "reconciliation/run", data: { shopId } }),
      ),
    );
    return { shops: shopIds.length };
  },
);
