import { createListRoute } from "@/lib/api/list-route";
import { listTransactions } from "@/lib/services/transaction.service";

/** Lists a shop's gateway transactions (paginated). Requires VIEWER+. */
export const GET = createListRoute(
  "/api/shops/[shopId]/payments",
  listTransactions,
);
