"use client";

import { Role } from "@prisma/client";
import { type ReactNode } from "react";

import { ShopContextProvider } from "@/components/providers/shop-context-provider";
import type { ShopContextValue } from "@/hooks/use-shop-context";
import type { SessionMembership } from "@/schemas/auth.schema";

interface StandaloneAuthProviderProps {
  children: ReactNode;
  shopId: string;
  role: Role;
  userId: string;
  userEmail: string;
  memberships: SessionMembership[];
}

/** Provides standalone shop context for authenticated finance portal routes. */
export function StandaloneAuthProvider({
  children,
  shopId,
  role,
  userId,
  userEmail,
  memberships,
}: StandaloneAuthProviderProps) {
  const value: ShopContextValue = {
    mode: "standalone",
    shopId,
    shopDomain: null,
    role,
    userId,
    userEmail,
    memberships,
    isBootstrapping: false,
    error: null,
  };

  return <ShopContextProvider value={value}>{children}</ShopContextProvider>;
}
