"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";

const TRIPLE_PRESS_WINDOW_MS = 1200;

/**
 * Easter egg: pressing "p" three times quickly (or clicking the logo five
 * times, which dispatches "pp:fly") sends a paper plane across the viewport.
 */
export function PaperPlane() {
  const [flightId, setFlightId] = useState(0);
  const [flying, setFlying] = useState(false);

  useEffect(() => {
    let presses: number[] = [];

    const fly = () => {
      setFlightId((id) => id + 1);
      setFlying(true);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key.toLowerCase() !== "p" || event.metaKey || event.ctrlKey || isTyping) {
        return;
      }

      const now = Date.now();
      presses = [...presses.filter((t) => now - t < TRIPLE_PRESS_WINDOW_MS), now];

      if (presses.length >= 3) {
        presses = [];
        fly();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pp:fly", fly);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pp:fly", fly);
    };
  }, []);

  if (!flying) {
    return null;
  }

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-100 overflow-hidden">
      <div
        key={flightId}
        className="pp-plane-fly absolute left-0 top-0"
        onAnimationEnd={() => setFlying(false)}
      >
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-(--pp-blue-glow) blur-xl" />
          <Send className="relative h-8 w-8 -rotate-12 text-(--pp-blue-bright)" />
        </div>
      </div>
    </div>
  );
}
