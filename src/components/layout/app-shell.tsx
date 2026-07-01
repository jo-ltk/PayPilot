import type { ReactNode } from "react";

import { DesktopSidebar } from "@/components/layout/desktop-sidebar";
import { CommandPalette } from "@/components/layout/command-palette";
import { TopBar } from "@/components/layout/top-bar";
import { DashboardProvider } from "@/components/providers/dashboard-provider";
import { NetworkStatusBanner } from "@/components/shared/network-status-banner";
import { PageTransition } from "@/components/shared/page-transition";
import type { NavItem } from "@/lib/navigation";

interface AppShellProps {
  children: ReactNode;
  navItems: NavItem[];
}

/** Responsive application shell with sidebar, top bar, and page container. */
export function AppShell({ children, navItems }: AppShellProps) {
  return (
    <DashboardProvider>
      <div className="flex min-h-screen bg-background">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow"
        >
          Skip to main content
        </a>
        <DesktopSidebar items={navItems} />
        <div className="flex min-w-0 flex-1 flex-col">
          <NetworkStatusBanner />
          <TopBar navItems={navItems} />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 focus:outline-none"
          >
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <CommandPalette navItems={navItems} />
      </div>
    </DashboardProvider>
  );
}
