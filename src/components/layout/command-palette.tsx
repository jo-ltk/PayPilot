"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useDashboardContext } from "@/components/providers/dashboard-provider";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { navIconMap } from "@/lib/navigation-icons";
import type { NavItem } from "@/lib/navigation";

interface CommandPaletteProps {
  navItems: NavItem[];
}

/** Global command palette for navigation, search, and quick actions. */
export function CommandPalette({ navItems }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { refresh } = useDashboardContext();

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  useKeyboardShortcuts({
    navItems,
    onOpenCommandPalette: handleOpen,
    onRefresh: refresh,
  });

  useEffect(() => {
    const handleExternalOpen = () => {
      setOpen(true);
    };

    window.addEventListener("paypilot:open-command-palette", handleExternalOpen);

    return () => {
      window.removeEventListener("paypilot:open-command-palette", handleExternalOpen);
    };
  }, []);

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    [],
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages and actions…" aria-label="Search commands" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {navItems.map((item, index) => {
            const Icon = navIconMap[item.icon];

            return (
              <CommandItem
                key={item.href}
                value={`${item.label} ${item.shortLabel}`}
                onSelect={() => {
                  runCommand(() => {
                    router.push(item.href);
                  });
                }}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
                {index < 7 ? <CommandShortcut>{index + 1}</CommandShortcut> : null}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem
            value="refresh data"
            onSelect={() => {
              runCommand(refresh);
            }}
          >
            <RefreshCw aria-hidden="true" />
            <span>Refresh data</span>
            <CommandShortcut>R</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
