"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import { EASE_OUT_EXPO, Magnetic, Reveal } from "@/components/landing/motion-primitives";

/** Closing CTA: oversized parallax wordmark with a magnetic action. */
export function CtaSection({ dashboardHref }: { dashboardHref: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const wordmarkY = useTransform(scrollYProgress, [0, 1], [90, -90]);

  return (
    <section ref={ref} className="relative overflow-hidden border-t border-(--pp-line) py-28 sm:py-40">
      <motion.p
        aria-hidden
        style={{ y: reduced ? 0 : wordmarkY }}
        className="pp-display pp-outline-text pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[24vw] font-semibold leading-none select-none"
      >
        PayPilot
      </motion.p>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--pp-blue) opacity-12 blur-[130px]"
      />

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <h2 className="pp-display text-4xl font-medium leading-[1.02] text-(--pp-ink) sm:text-6xl">
            Stop reconciling.
            <br />
            <span className="pp-grad-text">Start knowing.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-6 max-w-md text-base text-(--pp-dim) sm:text-lg">
            Connect your store in ten minutes. Your first reconciliation report
            is free — and probably overdue.
          </p>
        </Reveal>
        <Reveal delay={0.22}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Magnetic strength={0.3}>
              <Link
                href={dashboardHref}
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-(--pp-blue) px-9 text-base font-medium text-white shadow-[0_20px_45px_-14px_rgba(29,99,242,0.65)] transition-all duration-300 hover:bg-(--pp-blue-deep) hover:shadow-[0_26px_55px_-14px_rgba(29,99,242,0.75)]"
              >
                Take flight with PayPilot
                <motion.span
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white"
                  whileHover={{ rotate: -45 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                >
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-45" />
                </motion.span>
              </Link>
            </Magnetic>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <p className="pp-mono mt-8 text-[10px] text-(--pp-faint)">
            No credit card · 14-day full access · Cancel anytime
          </p>
        </Reveal>
      </div>
    </section>
  );
}
