"use client";

import { Menu } from "lucide-react";
import { useState } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { NavItem } from "@/lib/navigation";

interface MobileSidebarProps {
  items: NavItem[];
}

/** Mobile sidebar drawer triggered by a hamburger menu. */
export function MobileSidebar({ items }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            className="retro-pill size-10 justify-center border-transparent p-0 lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--retro-lilac)] text-[var(--retro-chart-strong)]">
          <Menu aria-hidden="true" className="size-4" />
        </span>
      </SheetTrigger>
      <SheetContent side="left" className="retro-sidebar w-72 p-0">
        <SheetHeader className="flex-row items-center gap-3 border-b border-sidebar-border px-5 py-6 text-left">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--retro-chart-strong)] font-retro text-lg font-semibold text-white">
            P
          </span>
          <div className="flex flex-col gap-0.5">
            <SheetTitle className="font-retro text-xl font-medium tracking-tight">
              PayPilot
            </SheetTitle>
            <p className="text-xs font-medium text-muted-foreground">
              Payment reconciliation
            </p>
          </div>
        </SheetHeader>
        <ScrollArea className="h-full px-3 py-5">
          <SidebarNav
            items={items}
            onNavigate={() => {
              setOpen(false);
            }}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
