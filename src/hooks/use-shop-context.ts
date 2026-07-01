import { Role } from "@prisma/client";
import { createContext, useContext } from "react";

import type { SessionMembership } from "@/schemas/auth.schema";

export type AppMode = "embedded" | "standalone";

export type ShopContextValue = {
  mode: AppMode;
  shopId: string | null;
  shopDomain: string | null;
  role: Role | null;
  userId?: string | null;
  userEmail?: string | null;
  memberships: SessionMembership[];
  isBootstrapping: boolean;
  error: string | null;
};

const defaultValue: ShopContextValue = {
  mode: "standalone",
  shopId: null,
  shopDomain: null,
  role: null,
  userId: null,
  userEmail: null,
  memberships: [],
  isBootstrapping: false,
  error: null,
};

export const ShopContext = createContext<ShopContextValue>(defaultValue);

/**
 * Reads the active shop context for embedded or standalone shells.
 * @returns Shop context value
 */
export function useShopContext(): ShopContextValue {
  return useContext(ShopContext);
}
