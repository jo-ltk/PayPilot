"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, GitCompareArrows, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";

import { EASE_OUT_EXPO, Reveal } from "@/components/landing/motion-primitives";
import { SectionHeading } from "@/components/landing/section-heading";
import {
  AnalyticsScreen,
  ReconciliationScreen,
  TransactionsScreen,
} from "@/components/landing/showcase-screens";

const TABS = [
  {
    id: "transactions",
    label: "Transactions",
    icon: ReceiptText,
    caption: "Every order, every method, every gateway — one ledger.",
    screen: TransactionsScreen,
  },
  {
    id: "reconciliation",
    label: "Reconciliation",
    icon: GitCompareArrows,
    caption: "Discrepancies surface themselves before your accountant asks.",
    screen: ReconciliationScreen,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    caption: "Net revenue after fees, refunds, and taxes — in real time.",
    screen: AnalyticsScreen,
  },
] as const;

const AUTO_ADVANCE_MS = 6000;

/** Interactive showcase: auto-rotating tabs over realistic module mockups. */
export function ShowcaseSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) {
      return;
    }

    const timer = setInterval(
      () => setActive((i) => (i + 1) % TABS.length),
      AUTO_ADVANCE_MS,
    );

    return () => clearInterval(timer);
  }, [paused]);

  const ActiveScreen = TABS[active].screen;

  return (
    <section id="showcase" className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="The product"
          title={
            <>
              One cockpit for the money
              <br className="hidden sm:block" />
              <span className="pp-grad-text"> you already earned</span>
            </>
          }
          description="Switch between the modules your finance team lives in. Each one is wired to the same reconciled source of truth."
        />

        <Reveal delay={0.15} className="mt-12 sm:mt-16">
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="flex gap-1.5 sm:gap-3">
              {TABS.map((tab, i) => {
                const Icon = tab.icon;
                const isActive = i === active;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`relative flex min-w-0 flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-full border bg-white px-2.5 py-2 text-xs whitespace-nowrap transition-colors duration-300 sm:flex-none sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${
                      isActive
                        ? "border-(--pp-blue)/60 text-(--pp-blue-deep)"
                        : "border-(--pp-line) text-(--pp-dim) hover:border-(--pp-line-strong) hover:text-(--pp-ink)"
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="pp-showcase-pill"
                        className="absolute inset-0 bg-(--pp-blue-soft)"
                        transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                      />
                    ) : null}
                    <Icon className="relative h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                    <span className="relative">{tab.label}</span>
                    {isActive && !paused ? (
                      <motion.span
                        key={`progress-${active}`}
                        className="absolute bottom-0 left-0 h-0.5 bg-(--pp-blue)"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: AUTO_ADVANCE_MS / 1000, ease: "linear" }}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="pp-card relative mt-6 overflow-hidden bg-gradient-to-br from-white to-(--pp-blue-tint)/70 p-4 sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-32 right-0 h-64 w-96 rounded-full bg-(--pp-blue) opacity-8 blur-[100px]"
              />
              <AnimatePresence mode="wait">
                <motion.div
                  key={TABS[active].id}
                  initial={{ opacity: 0, y: 24, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.99 }}
                  transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                >
                  <p className="mb-5 text-base text-(--pp-dim) sm:text-lg">
                    {TABS[active].caption}
                  </p>
                  <ActiveScreen />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
