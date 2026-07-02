"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import {
  Banknote,
  CreditCard,
  GitCompareArrows,
  LineChart,
  ShoppingBag,
} from "lucide-react";
import { useRef } from "react";

import { Reveal } from "@/components/landing/motion-primitives";
import { SectionHeading } from "@/components/landing/section-heading";

const STAGES = [
  {
    icon: ShoppingBag,
    step: "01",
    title: "Shopify order placed",
    body: "A customer checks out. PayPilot captures the order, line items, taxes, and payment intent the moment Shopify fires the webhook.",
    detail: "orders/paid · < 400ms ingest",
  },
  {
    icon: CreditCard,
    step: "02",
    title: "Gateway captures payment",
    body: "Razorpay, PayU, or any gateway processes the charge. We pull the transaction with its fees, method, and gateway reference ID.",
    detail: "MDR + GST computed per txn",
  },
  {
    icon: Banknote,
    step: "03",
    title: "Settlement hits your bank",
    body: "Days later, the gateway settles a lump sum. PayPilot ingests the settlement report and splits it back into individual orders.",
    detail: "T+1 to T+3 · UTR tracked",
  },
  {
    icon: GitCompareArrows,
    step: "04",
    title: "Reconciliation runs itself",
    body: "Every order is matched against its gateway transaction and bank settlement. Mismatches, missing payouts, and double refunds get flagged.",
    detail: "99%+ auto-match rate",
  },
  {
    icon: LineChart,
    step: "05",
    title: "Analytics you can trust",
    body: "Because every number is reconciled first, your revenue, fees, and refund analytics are audit-grade — not gateway estimates.",
    detail: "Net revenue · fee leakage · trends",
  },
] as const;

function StageCard({ stage, index }: { stage: (typeof STAGES)[number]; index: number }) {
  const Icon = stage.icon;
  const fromLeft = index % 2 === 0;

  return (
    <div
      className={`relative flex pl-14 md:w-1/2 ${
        fromLeft ? "md:mr-auto md:pr-16 md:pl-0" : "md:ml-auto md:pl-16"
      }`}
    >
      <motion.div
        initial={{ opacity: 0, x: fromLeft ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -4 }}
        className="pp-card group w-full p-6 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--pp-blue-soft) text-(--pp-blue) transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-5 w-5" />
          </span>
          <span className="pp-outline-text pp-display text-4xl font-semibold">
            {stage.step}
          </span>
        </div>
        <h3 className="pp-display mt-5 text-xl font-medium text-(--pp-ink) sm:text-2xl">
          {stage.title}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-(--pp-dim)">{stage.body}</p>
        <p className="pp-mono mt-4 text-[10px] text-(--pp-blue)">{stage.detail}</p>
      </motion.div>

      <div
        className={`absolute top-8 left-[13px] md:left-auto ${
          fromLeft ? "md:-right-[9px]" : "md:-left-[9px]"
        }`}
      >
        <span className="block h-[18px] w-[18px] rounded-full border-2 border-(--pp-blue) bg-(--pp-bg)" />
      </div>
    </div>
  );
}

/** Scroll-driven timeline: Shopify → Gateway → Settlement → Recon → Analytics. */
export function FlowSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 70%", "end 65%"],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const glowY = useTransform(lineScale, (v) => `${v * 100}%`);

  return (
    <section id="how-it-works" className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          align="center"
          eyebrow="How it works"
          title={
            <>
              Follow the money,
              <span className="pp-grad-text"> end to end</span>
            </>
          }
          description="From checkout to audit-ready analytics — scroll to trace the journey every rupee takes through PayPilot."
        />

        <div ref={trackRef} className="relative mx-auto mt-16 max-w-4xl sm:mt-20">
          <div className="absolute inset-y-0 left-[21px] w-0.5 bg-(--pp-line) md:left-1/2 md:-translate-x-1/2" />
          <motion.div
            style={{ scaleY: lineScale }}
            className="absolute inset-y-0 left-[21px] w-0.5 origin-top bg-gradient-to-b from-(--pp-blue) to-(--pp-blue-bright) md:left-1/2 md:-translate-x-1/2"
          />
          <motion.div
            style={{ top: glowY }}
            className="absolute left-[21px] h-3 w-3 -translate-x-[5px] rounded-full bg-(--pp-blue) shadow-[0_0_20px_4px_rgba(29,99,242,0.45)] md:left-1/2 md:-translate-x-1/2"
          />

          <div className="flex flex-col gap-10 md:gap-14">
            {STAGES.map((stage, i) => (
              <StageCard key={stage.step} stage={stage} index={i} />
            ))}
          </div>
        </div>

        <Reveal className="mt-16 text-center">
          <p className="pp-display text-lg font-medium text-(--pp-dim) sm:text-xl">
            The whole journey, without a single spreadsheet.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
