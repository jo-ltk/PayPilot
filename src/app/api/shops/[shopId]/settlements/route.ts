import { createListRoute } from "@/lib/api/list-route";
import { listSettlements } from "@/lib/services/settlement.service";

/** Lists a shop's settlement batches (paginated). Requires VIEWER+. */
export const GET = createListRoute(
  "/api/shops/[shopId]/settlements",
  listSettlements,
);
