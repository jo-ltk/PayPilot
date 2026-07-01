"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navIconMap } from "@/lib/navigation-icons";
import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  items: NavItem[];
  onNavigate?: () => void;
  className?: string;
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

/** Vertical navigation list with Lucide icons and active states. */
export function SidebarNav({ items, onNavigate, className }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const Icon = navIconMap[item.icon];
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
