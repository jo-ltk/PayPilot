import { SidebarNav } from "@/components/layout/sidebar-nav";
import { BrandMark } from "@/components/shared/brand-mark";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface DesktopSidebarProps {
  items: NavItem[];
  className?: string;
}

/** Fixed desktop sidebar for the application shell. */
export function DesktopSidebar({ items, className }: DesktopSidebarProps) {
  return (
    <aside
      className={cn(
        "retro-sidebar hidden w-64 shrink-0 border-r border-sidebar-border lg:flex lg:flex-col",
        className,
      )}
    >
      <div className="border-b border-sidebar-border px-5 py-6">
        <BrandMark href="/" subtitle="Payment reconciliation" />
      </div>
      <ScrollArea className="flex-1 px-3 py-5">
        <SidebarNav items={items} />
      </ScrollArea>
    </aside>
  );
}
