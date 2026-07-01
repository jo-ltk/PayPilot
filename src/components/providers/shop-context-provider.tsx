"use client";

import { useMemo, type ReactNode } from "react";

import {
  ShopContext,
  type ShopContextValue,
} from "@/hooks/use-shop-context";

interface ShopContextProviderProps {
  children: ReactNode;
  value: ShopContextValue;
}

/** Provides shop identity and auth mode to client components. */
export function ShopContextProvider({
  children,
  value,
}: ShopContextProviderProps) {
  const memoized = useMemo(() => value, [value]);

  return (
    <ShopContext.Provider value={memoized}>{children}</ShopContext.Provider>
  );
}
