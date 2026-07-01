"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { defaultDashboardRange } from "@/lib/dashboard";
import { useShopContext } from "@/hooks/use-shop-context";
import type { DateRange } from "@/types/common";

type DashboardContextValue = {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  refresh: () => void;
  isRefreshing: boolean;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

interface DashboardProviderProps {
  children: ReactNode;
}

/** Provides shared dashboard date range and refresh controls. */
export function DashboardProvider({ children }: DashboardProviderProps) {
  const [dateRange, setDateRange] = useState<DateRange>(defaultDashboardRange);
  const queryClient = useQueryClient();
  const { shopId } = useShopContext();

  const refresh = useCallback(() => {
    if (!shopId) {
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ["shop", shopId] });
  }, [queryClient, shopId]);

  const fetchingCount = useIsFetching({
    queryKey: shopId ? ["shop", shopId] : undefined,
  });

  const value = useMemo(
    () => ({
      dateRange,
      setDateRange,
      refresh,
      isRefreshing: fetchingCount > 0,
    }),
    [dateRange, refresh, fetchingCount],
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

/**
 * Reads dashboard toolbar state (date range, refresh).
 * @returns Dashboard context value
 */
export function useDashboardContext(): DashboardContextValue {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboardContext requires DashboardProvider");
  }

  return context;
}
