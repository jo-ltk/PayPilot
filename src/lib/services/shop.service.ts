import type { Shop } from "@prisma/client";

import { encrypt } from "@/lib/crypto/encrypt";
import { prisma } from "@/lib/db";
import type { ShopView } from "@/schemas/payments.schema";

export type ShopInstallInput = {
  shopDomain: string;
  accessToken: string;
  scope: string;
};

/**
 * Upserts a Shop and its encrypted Shopify offline session.
 *
 * The offline access token is encrypted at rest. New installs advance to the
 * `CONNECT_GATEWAY` onboarding step; re-installs are reactivated without
 * resetting their existing onboarding progress.
 * @param input - Shop domain plus offline token and granted scope
 * @returns The upserted Shop record
 */
export async function upsertShopWithSession(
  input: ShopInstallInput,
): Promise<Shop> {
  const accessToken = encrypt(input.accessToken);
  const sessionData = { accessToken, scope: input.scope };

  return prisma.shop.upsert({
    where: { shopDomain: input.shopDomain },
    update: {
      isActive: true,
      uninstalledAt: null,
      session: {
        upsert: { create: sessionData, update: sessionData },
      },
    },
    create: {
      shopDomain: input.shopDomain,
      shopName: input.shopDomain,
      onboardingStep: "CONNECT_GATEWAY",
      session: { create: sessionData },
    },
  });
}

/**
 * Maps a shop record to its dashboard list view.
 * @param shop - Shop record
 * @returns Shop view
 */
export function toShopView(shop: Shop): ShopView {
  return {
    id: shop.id,
    shopDomain: shop.shopDomain,
    shopName: shop.shopName,
    currency: shop.currency,
    isActive: shop.isActive,
    onboardingStep: shop.onboardingStep,
  };
}

/**
 * Lists shops the given shop ids belong to, for the shops dashboard.
 * @param shopIds - Shop ids the current user is a member of
 * @returns Shop summaries ordered by name
 */
export async function listShopsByIds(shopIds: string[]): Promise<Shop[]> {
  if (shopIds.length === 0) {
    return [];
  }
  return prisma.shop.findMany({
    where: { id: { in: shopIds } },
    orderBy: { shopName: "asc" },
  });
}

/**
 * Returns the ids of all active shops, used to fan out nightly reconciliation.
 * @returns Active shop ids
 */
export async function listActiveShopIds(): Promise<string[]> {
  const shops = await prisma.shop.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  return shops.map((shop) => shop.id);
}

/**
 * Deactivates a shop on `app/uninstalled` and deletes its access token.
 *
 * Historical domain data is retained; only the session (offline token) is
 * removed so the app can no longer call the Admin API.
 * @param shopId - Shop to deactivate
 */
export async function deactivateShop(shopId: string): Promise<void> {
  await prisma.shopifySession.deleteMany({ where: { shopId } });
  await prisma.shop.update({
    where: { id: shopId },
    data: { isActive: false, uninstalledAt: new Date() },
  });
}
