import { createListRoute } from "@/lib/api/list-route";
import { listReconciliation } from "@/lib/services/reconciliation.service";

/** Lists a shop's reconciliation records (paginated). Requires VIEWER+. */
export const GET = createListRoute(
  "/api/shops/[shopId]/reconciliation",
  listReconciliation,
);
