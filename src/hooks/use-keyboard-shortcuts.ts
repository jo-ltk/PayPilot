"use client";

import { useEffect } from "react";

import type { NavItem } from "@/lib/navigation";

interface KeyboardShortcutHandlers {
  navItems: NavItem[];
  onOpenCommandPalette: () => void;
  onRefresh?: () => void;
  enabled?: boolean;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

/**
 * Registers global keyboard shortcuts for navigation and actions.
 * @param handlers - Shortcut callbacks and nav items for digit jumps
 */
export function useKeyboardShortcuts({
  navItems,
  onOpenCommandPalette,
  onRefresh,
  enabled = true,
}: KeyboardShortcutHandlers): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();
      const meta = event.metaKey || event.ctrlKey;

      if (meta && key === "k") {
        event.preventDefault();
        onOpenCommandPalette();
        return;
      }

      if (!meta && !event.altKey && !event.shiftKey && key === "r" && onRefresh) {
        event.preventDefault();
        onRefresh();
        return;
      }

      if (!meta && !event.altKey && !event.shiftKey && /^[1-7]$/.test(key)) {
        const index = Number(key) - 1;
        const item = navItems[index];

        if (item) {
          event.preventDefault();
          window.location.assign(item.href);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, navItems, onOpenCommandPalette, onRefresh]);
}
