import { SidebarNav } from "@/components/layout/sidebar-nav";
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
        "hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col",
        className,
      )}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
            PayPilot
          </span>
          <span className="text-xs text-muted-foreground">
            Payment reconciliation
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-6">
        <SidebarNav items={items} />
      </ScrollArea>
    </aside>
  );
}
