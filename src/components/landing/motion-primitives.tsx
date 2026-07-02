"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  useEffect,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before the reveal starts. */
  delay?: number;
  /** Initial vertical offset in px. */
  y?: number;
  once?: boolean;
}

/** Scroll-triggered reveal: blur-up + rise, tuned for premium pacing. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
}: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** Pull strength — fraction of cursor offset applied as translation. */
  strength?: number;
}

/** Wrapper that magnetically pulls its child toward the cursor. */
export function Magnetic({
  children,
  className,
  strength = 0.28,
}: MagneticProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 18, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 260, damping: 18, mass: 0.5 });
  const reduced = useReducedMotion();

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (reduced) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * strength);
    y.set((event.clientY - rect.top - rect.height / 2) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className={className}
      style={{ x: springX, y: springY, display: "inline-block" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}

interface CountUpProps {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}

/** Animates a number from zero when it first scrolls into view. */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.8,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;

    if (!node || !inView) {
      return;
    }

    const format = (value: number) =>
      `${prefix}${value.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

    if (reduced) {
      node.textContent = format(to);
      return;
    }

    const controls = animate(0, to, {
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: (value) => {
        node.textContent = format(value);
      },
    });

    return () => controls.stop();
  }, [inView, to, prefix, suffix, decimals, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}

export { EASE_OUT_EXPO };
