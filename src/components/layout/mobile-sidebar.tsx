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
            size="icon-sm"
            className="lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <Menu aria-hidden="true" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border px-6 py-5 text-left">
          <SheetTitle className="text-lg font-semibold tracking-tight">
            PayPilot
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full px-4 py-4">
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
