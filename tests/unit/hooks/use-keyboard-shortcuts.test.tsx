import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { embeddedNavItems } from "@/lib/navigation";

describe("useKeyboardShortcuts", () => {
  it("opens command palette on Ctrl+K", () => {
    const onOpenCommandPalette = vi.fn();

    renderHook(() =>
      useKeyboardShortcuts({
        navItems: embeddedNavItems,
        onOpenCommandPalette,
      }),
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
    );

    expect(onOpenCommandPalette).toHaveBeenCalledOnce();
  });

  it("ignores shortcuts when typing in an input", () => {
    const onOpenCommandPalette = vi.fn();
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    renderHook(() =>
      useKeyboardShortcuts({
        navItems: embeddedNavItems,
        onOpenCommandPalette,
      }),
    );

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }),
    );

    expect(onOpenCommandPalette).not.toHaveBeenCalled();
    input.remove();
  });
});
