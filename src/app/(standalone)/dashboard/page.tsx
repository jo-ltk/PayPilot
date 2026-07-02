import { redirect } from "next/navigation";

import {
  APP_ENTRY_PATH,
  buildShopDashboardPath,
} from "@/lib/app-entry";
import { getCurrentSession } from "@/lib/auth/require-shop-access";

/** Routes marketing CTAs to the signed-in shop dashboard or login. */
export default async function DashboardEntryPage() {
  const session = await getCurrentSession();
  const shopId = session?.memberships[0]?.shopId;

  if (shopId) {
    redirect(buildShopDashboardPath(shopId));
  }

  redirect(`/login?redirect=${encodeURIComponent(APP_ENTRY_PATH)}`);
}
