"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  BarChart3,
  GitCompareArrows,
  ReceiptText,
  Undo2,
  Users,
} from "lucide-react";

import { BentoCard } from "@/components/landing/bento-card";
import { Reveal } from "@/components/landing/motion-primitives";
import { SectionHeading } from "@/components/landing/section-heading";

function MatchMeter() {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="pp-mono text-[9px] text-(--pp-faint)">Auto-match rate</span>
        <span className="pp-display text-2xl font-medium text-(--pp-blue)">99.2%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-(--pp-surface)">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "99.2%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full bg-gradient-to-r from-(--pp-blue) to-(--pp-blue-bright)"
        />
      </div>
    </div>
  );
}

function PayoutChips() {
  return (
    <div className="flex flex-wrap gap-2">
      {["T+1 · ₹1.2L", "T+2 · ₹3.4L", "UTR verified"].map((chip) => (
        <span
          key={chip}
          className="rounded-full bg-(--pp-blue-tint) px-3 py-1 font-mono text-[10px] text-(--pp-blue-deep)"
        >
          {chip}
        </span>
      ))}
    </div>
  );
}

function SparkBars() {
  const bars = [35, 55, 42, 70, 58, 85, 64, 92];

  return (
    <div className="flex h-12 items-end gap-1.5">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ height: `${h}%`, transformOrigin: "bottom" }}
          className={`flex-1 rounded-t-sm ${i === 7 ? "bg-(--pp-blue)" : "bg-(--pp-blue-soft)"}`}
        />
      ))}
    </div>
  );
}

function TeamAvatars() {
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2.5">
        {["AR", "PK", "SM", "DV"].map((initials, i) => (
          <span
            key={initials}
            style={{ zIndex: 4 - i }}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-(--pp-blue-soft) text-[9px] font-semibold text-(--pp-blue-deep)"
          >
            {initials}
          </span>
        ))}
      </div>
      <span className="ml-3 text-[11px] text-(--pp-faint)">Owner · Finance · Ops · Viewer</span>
    </div>
  );
}

/** Bento grid covering the six core PayPilot modules. */
export function BentoSection() {
  return (
    <section id="features" className="relative py-24 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-1/3 h-96 w-96 rounded-full bg-(--pp-blue) opacity-8 blur-[140px]"
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Features"
          title={
            <>
              Six modules.
              <span className="pp-grad-text"> Zero blind spots.</span>
            </>
          }
          description="Everything between checkout and your bank statement, organized the way finance teams actually work."
        />

        <Reveal delay={0.1} className="mt-12 sm:mt-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2">
            <BentoCard
              icon={GitCompareArrows}
              title="Reconciliation"
              body="Three-way matching across Shopify orders, gateway transactions, and bank settlements. Discrepancies are flagged with the exact paise difference and a suggested fix."
              className="lg:col-span-3"
            >
              <MatchMeter />
            </BentoCard>

            <BentoCard
              icon={BarChart3}
              title="Analytics"
              body="Audit-grade revenue, fee, and refund analytics built only on reconciled numbers."
              className="lg:col-span-3"
            >
              <SparkBars />
            </BentoCard>

            <BentoCard
              icon={ReceiptText}
              title="Transactions"
              body="A unified ledger of every payment across all gateways, searchable to the paise."
              className="lg:col-span-2"
            />

            <BentoCard
              icon={Banknote}
              title="Settlements"
              body="Track every payout from initiation to bank credit, with UTR numbers and fee breakdowns."
              className="lg:col-span-2"
            >
              <PayoutChips />
            </BentoCard>

            <BentoCard
              icon={Undo2}
              title="Refunds"
              body="Follow refunds from Shopify back through the gateway, and catch the ones that never left."
              className="lg:col-span-2"
            />

            <BentoCard
              icon={Users}
              title="Team management"
              body="Role-based access for owners, finance, and ops — with an audit trail on every resolution."
              className="sm:col-span-2 lg:col-span-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:py-6"
            >
              <TeamAvatars />
            </BentoCard>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
