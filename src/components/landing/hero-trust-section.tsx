"use client";

import { motion, useReducedMotion } from "framer-motion";

import { EASE_OUT_EXPO } from "@/components/landing/motion-primitives";

const GATEWAYS = [
  "Shopify Payments", "Razorpay", "PayU", "Stripe", "Cashfree",
  "PhonePe", "CCAvenue", "HDFC SmartGateway",
];

/** One marquee half — repeated enough times to fill any viewport width. */
const MARQUEE_HALF = Array(5).fill(GATEWAYS).flat() as string[];

/** Full-width trust bar — compact band below the hero. */
export function HeroTrustSection() {
  const reduced = useReducedMotion();

  return (
    <section className="relative z-20 overflow-hidden bg-(--pp-bg) py-8 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        className="w-full"
      >
        {reduced ? (
          <div className="flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 sm:gap-x-10 sm:px-6 lg:justify-between">
            {GATEWAYS.map((name) => (
              <span
                key={name}
                className="pp-mono whitespace-nowrap text-xs text-(--pp-faint) sm:text-sm"
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          <div className="pp-marquee-mask-trust w-full overflow-hidden">
            <div className="pp-marquee-track flex w-max items-center gap-10 sm:gap-14">
              {[...MARQUEE_HALF, ...MARQUEE_HALF].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="pp-mono whitespace-nowrap text-xs text-(--pp-faint) transition-colors hover:text-(--pp-blue-bright) sm:text-sm"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
}
