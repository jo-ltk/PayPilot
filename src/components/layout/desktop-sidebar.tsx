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
        "retro-sidebar hidden w-64 shrink-0 border-r border-sidebar-border lg:flex lg:flex-col",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--retro-chart-strong)] font-retro text-lg font-semibold text-white">
          P
        </span>
        <div className="flex flex-col gap-0.5">
          <span className="font-retro text-xl font-medium tracking-tight text-sidebar-foreground">
            PayPilot
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            Payment reconciliation
          </span>
        </div>
      </div>
      <ScrollArea className="flex-1 px-3 py-5">
        <SidebarNav items={items} />
      </ScrollArea>
    </aside>
  );
}
