"use client";

import { LayoutDashboard, RefreshCw, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ShopSwitcher } from "@/components/layout/shop-switcher";
import { UserMenu } from "@/components/layout/user-menu";
import { useDashboardContext } from "@/components/providers/dashboard-provider";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/lib/navigation";
import { navIconMap } from "@/lib/navigation-icons";
import { cn } from "@/lib/utils";

interface TopBarProps {
  navItems: NavItem[];
}

interface ActiveNavMatch {
  label: string;
  index: number;
}

function resolveActiveNav(pathname: string, navItems: NavItem[]): ActiveNavMatch | null {
  const index = navItems.findIndex((item) => isActivePath(pathname, item.href));

  if (index === -1) {
    return null;
  }

  return { label: navItems[index].label, index };
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
  const activeNav = resolveActiveNav(pathname, navItems);
  const title = activeNav?.label ?? "PayPilot";
  const PageIcon =
    activeNav !== null ? navIconMap[navItems[activeNav.index].icon] : LayoutDashboard;
  const onDashboard = isDashboardRoute(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-background/90 px-3 backdrop-blur supports-backdrop-filter:bg-background/75 sm:h-20 sm:gap-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <MobileSidebar items={navItems} />
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--retro-chart-strong)] text-white shadow-[0_0_0_1px_var(--retro-ink)] sm:size-11">
          <PageIcon aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="hidden text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--retro-chart-strong)] sm:block">
            PayPilot
          </p>
          <h2 className="truncate font-retro text-lg font-medium tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          className="retro-pill size-10 justify-center border-transparent p-0 text-muted-foreground sm:h-11 sm:w-auto sm:justify-start sm:gap-2.5 sm:pl-1.5 sm:pr-3"
          aria-label="Open command palette"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("paypilot:open-command-palette"));
          }}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--retro-pink)] text-[var(--retro-chart-strong)]">
            <Search aria-hidden="true" className="size-4" />
          </span>
          <span className="hidden font-retro text-sm font-medium text-foreground sm:inline">
            Search
          </span>
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
      <DateRangePicker value={dateRange} onChange={setDateRange} variant="chip" />
      <Button
        type="button"
        variant="outline"
        className="retro-pill size-10 justify-center border-transparent p-0 sm:h-11 sm:w-auto sm:justify-start sm:gap-2.5 sm:pl-1.5 sm:pr-3"
        aria-label="Refresh dashboard data"
        disabled={isRefreshing}
        onClick={refresh}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--retro-mint)] text-[var(--retro-chart-strong)]">
          <RefreshCw
            aria-hidden="true"
            className={cn("size-4", isRefreshing && "animate-spin")}
          />
        </span>
        <span className="hidden font-retro text-sm font-medium text-foreground sm:inline">
          Refresh
        </span>
      </Button>
    </>
  );
}
