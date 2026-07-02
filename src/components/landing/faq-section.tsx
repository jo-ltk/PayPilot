"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/landing/motion-primitives";
import { SectionHeading } from "@/components/landing/section-heading";

const FAQS = [
  {
    question: "How long does setup take?",
    answer:
      "About ten minutes. Install the Shopify app, connect your gateway accounts with read-only API keys, and PayPilot backfills up to 24 months of history overnight — reconciled and ready by morning.",
  },
  {
    question: "Which payment gateways do you support?",
    answer:
      "Razorpay, PayU, Cashfree, PhonePe, CCAvenue, Stripe, and Shopify Payments, with more added regularly. Each connector understands that gateway's exact settlement report format, fee structure, and GST treatment.",
  },
  {
    question: "Can PayPilot move or hold my money?",
    answer:
      "No — and that's deliberate. PayPilot is strictly read-only. We ingest webhooks and settlement reports to reconcile your records, but we have no ability to initiate, modify, or redirect any payment.",
  },
  {
    question: "What happens when a mismatch is found?",
    answer:
      "It lands in your reconciliation queue with full context: the Shopify order, the gateway transaction, the settlement line, and the exact paise difference. You resolve it in one click, and every resolution is recorded in the audit trail.",
  },
  {
    question: "Does it handle GST on gateway fees?",
    answer:
      "Yes. Every fee line is split into MDR and GST components per transaction, so your input-tax-credit claims and P&L are accurate without manual work.",
  },
  {
    question: "What does it cost?",
    answer:
      "Plans scale with your monthly transaction volume, starting free for stores doing under ₹5 lakhs a month. No per-seat pricing — bring your whole finance team.",
  },
] as const;

function FaqItem({
  faq,
  open,
  onToggle,
}: {
  faq: (typeof FAQS)[number];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-2xl transition-shadow duration-300 ${
        open
          ? "bg-white shadow-[0_0_0_1px_rgba(29,99,242,0.35),0_16px_36px_-20px_rgba(29,99,242,0.45)]"
          : "bg-white shadow-[0_0_0_1px_var(--pp-line)] hover:shadow-[0_0_0_1px_var(--pp-line-strong),0_10px_28px_-20px_rgba(29,99,242,0.4)]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-base font-medium text-(--pp-ink) sm:text-lg">{faq.question}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            open ? "bg-(--pp-blue-soft) text-(--pp-blue)" : "bg-(--pp-surface) text-(--pp-dim)"
          }`}
        >
          <Plus className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-sm leading-relaxed text-(--pp-dim)">{faq.answer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** FAQ accordion with animated expand/collapse. */
export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <SectionHeading
              eyebrow="FAQ"
              title={
                <>
                  Answers,
                  <span className="pp-grad-text"> reconciled</span>
                </>
              }
              description="Everything merchants ask before they stop doing this in spreadsheets."
            />
          </div>

          <Reveal delay={0.1}>
            <div className="flex flex-col gap-3">
              {FAQS.map((faq, i) => (
                <FaqItem
                  key={faq.question}
                  faq={faq}
                  open={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
