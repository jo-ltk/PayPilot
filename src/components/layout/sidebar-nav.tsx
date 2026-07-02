"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navIconMap } from "@/lib/navigation-icons";
import type { NavItem } from "@/lib/navigation";
import { getRetroChipColor } from "@/lib/retro-chip-colors";
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
    <nav aria-label="Main navigation" className={cn("flex flex-col gap-1.5", className)}>
      {items.map((item, index) => {
        const Icon = navIconMap[item.icon];
        const active = isActivePath(pathname, item.href);
        const chipStyle = getRetroChipColor(index);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-3 py-2.5 font-retro text-base tracking-tight transition-all duration-150",
              active
                ? "bg-[var(--retro-chip)] font-medium text-foreground shadow-[0_0_0_1px_var(--retro-ink)]"
                : "font-normal text-foreground/70 hover:translate-x-0.5 hover:bg-secondary/70 hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-150 group-hover:scale-105",
                active ? "bg-[var(--retro-chart-strong)] text-white" : chipStyle,
              )}
            >
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
