import { createListRoute } from "@/lib/api/list-route";
import { listRefunds } from "@/lib/services/refund.service";

/** Lists a shop's refunds (paginated). Requires VIEWER+. */
export const GET = createListRoute("/api/shops/[shopId]/refunds", listRefunds);
