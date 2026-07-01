"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
}

/**
 * Animates a numeric value with a subtle count-up on change.
 * @param props - Value and optional formatter
 */
export function AnimatedNumber({
  value,
  format = (next) => String(next),
  className,
}: AnimatedNumberProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <span className={className}>{format(value)}</span>;
  }

  return (
    <AnimatedNumberInner
      value={value}
      format={format}
      className={className ?? ""}
    />
  );
}

function AnimatedNumberInner({
  value,
  format,
  className,
}: Required<Pick<AnimatedNumberProps, "value" | "format" | "className">>) {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef<number | null>(null);
  const displayRef = useRef(value);

  useEffect(() => {
    const start = displayRef.current;
    const delta = value - start;
    const duration = 500;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const next = start + delta * eased;
      setDisplay(next);
      displayRef.current = next;

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value]);

  return <span className={className}>{format(display)}</span>;
}
