"use client";

import { RefreshCw, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ShopSwitcher } from "@/components/layout/shop-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { useDashboardContext } from "@/components/providers/dashboard-provider";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface TopBarProps {
  navItems: NavItem[];
}

function resolvePageTitle(pathname: string, navItems: NavItem[]): string {
  const match = navItems.find((item) => isActivePath(pathname, item.href));

  return match?.label ?? "PayPilot";
}

function isNavIndexRoute(href: string): boolean {
  const parts = href.split("/").filter(Boolean);

  if (parts[0] === "app") {
    return parts.length === 1;
  }

  if (parts[0] === "shops") {
    return parts.length === 2;
  }

  return parts.length <= 1;
}

function isActivePath(pathname: string, href: string): boolean {
  if (pathname === href) {
    return true;
  }

  if (isNavIndexRoute(href)) {
    return false;
  }

  return pathname.startsWith(`${href}/`);
}

function isDashboardRoute(pathname: string): boolean {
  if (pathname === "/app") {
    return true;
  }

  return /^\/shops\/[^/]+$/.test(pathname);
}

/** Top navigation bar with page title and shell actions. */
export function TopBar({ navItems }: TopBarProps) {
  const pathname = usePathname();
  const title = resolvePageTitle(pathname, navItems);
  const onDashboard = isDashboardRoute(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar items={navItems} />
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            PayPilot
          </p>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden gap-2 text-muted-foreground md:flex"
          aria-label="Open command palette"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("paypilot:open-command-palette"));
          }}
        >
          <Search aria-hidden="true" className="size-4" />
          <span className="text-xs">Search</span>
          <kbd className="pointer-events-none hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium lg:inline">
            ⌘K
          </kbd>
        </Button>
        <ShopSwitcher />
        {onDashboard ? <DashboardControls /> : null}
        <UserMenu />
      </div>
    </header>
  );
}

function DashboardControls() {
  const { dateRange, setDateRange, refresh, isRefreshing } =
    useDashboardContext();

  return (
    <>
      <DateRangePicker
        value={dateRange}
        onChange={setDateRange}
        className="hidden sm:flex"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Refresh dashboard data"
        disabled={isRefreshing}
        onClick={refresh}
      >
        <RefreshCw
          aria-hidden="true"
          className={cn("size-4", isRefreshing && "animate-spin")}
        />
        <span className="hidden md:inline">Refresh</span>
      </Button>
    </>
  );
}
