import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  RefreshCw,
  Scale,
  Settings,
  Wallet,
} from "lucide-react";

import type { NavIconName } from "@/lib/navigation";

/** Maps serializable nav icon keys to Lucide components. */
export const navIconMap: Record<NavIconName, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "arrow-left-right": ArrowLeftRight,
  wallet: Wallet,
  "refresh-cw": RefreshCw,
  scale: Scale,
  "bar-chart-3": BarChart3,
  settings: Settings,
};
