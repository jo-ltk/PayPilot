export type NavIconName =
  | "layout-dashboard"
  | "arrow-left-right"
  | "wallet"
  | "refresh-cw"
  | "scale"
  | "bar-chart-3"
  | "settings";

export interface NavItem {
  href: string;
  label: string;
  icon: NavIconName;
  shortLabel: string;
}

/**
 * Builds the shop-scoped base path for embedded or standalone shells.
 * @param mode - App shell mode
 * @param shopId - Active shop id (standalone only)
 * @returns Base path without trailing slash
 */
export function buildShopBasePath(
  mode: "embedded" | "standalone",
  shopId: string | null,
): string {
  if (mode === "embedded") {
    return "/app";
  }

  return shopId ? `/shops/${shopId}` : "/shops";
}

/** Primary sidebar navigation for the embedded PayPilot shell. */
export const embeddedNavItems: NavItem[] = [
  {
    href: "/app",
    label: "Dashboard",
    icon: "layout-dashboard",
    shortLabel: "Dashboard",
  },
  {
    href: "/app/transactions",
    label: "Transactions",
    icon: "arrow-left-right",
    shortLabel: "Transactions",
  },
  {
    href: "/app/settlements",
    label: "Settlements",
    icon: "wallet",
    shortLabel: "Settlements",
  },
  {
    href: "/app/refunds",
    label: "Refunds",
    icon: "refresh-cw",
    shortLabel: "Refunds",
  },
  {
    href: "/app/reconciliation",
    label: "Reconciliation",
    icon: "scale",
    shortLabel: "Reconciliation",
  },
  {
    href: "/app/analytics",
    label: "Analytics",
    icon: "bar-chart-3",
    shortLabel: "Analytics",
  },
  {
    href: "/app/settings",
    label: "Settings",
    icon: "settings",
    shortLabel: "Settings",
  },
];
