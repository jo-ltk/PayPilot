"use client";

import { motion } from "framer-motion";
import { FileCheck2, Fingerprint, Lock, ServerCog, ShieldCheck, Siren } from "lucide-react";

import { Reveal } from "@/components/landing/motion-primitives";
import { SectionHeading } from "@/components/landing/section-heading";

const PILLARS = [
  {
    icon: Lock,
    title: "Encryption everywhere",
    body: "AES-256 at rest, TLS 1.3 in transit. Gateway API keys are envelope-encrypted and never leave our vault.",
  },
  {
    icon: Fingerprint,
    title: "Least-privilege access",
    body: "Role-based permissions, mandatory 2FA, and short-lived sessions scoped to a single store.",
  },
  {
    icon: FileCheck2,
    title: "Immutable audit trail",
    body: "Every reconciliation decision is logged with who, when, and why — exportable for your auditors.",
  },
  {
    icon: ServerCog,
    title: "Read-only by design",
    body: "PayPilot never touches your money. We read reports and webhooks; we cannot move a single rupee.",
  },
  {
    icon: Siren,
    title: "Anomaly alerts",
    body: "Unusual settlement gaps, fee spikes, or refund patterns trigger alerts before they become losses.",
  },
] as const;

const BADGES = ["SOC 2 Type II", "ISO 27001", "PCI-DSS aware", "GDPR & DPDP ready"];

/** Security section: radar-style centerpiece with orbiting trust pillars. */
export function SecuritySection() {
  return (
    <section id="security" className="relative overflow-hidden border-y border-(--pp-line) bg-gradient-to-b from-(--pp-surface) to-(--pp-bg) py-24 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <SectionHeading
              eyebrow="Security & trust"
              title={
                <>
                  Your money data,
                  <span className="pp-grad-text"> treated like money</span>
                </>
              }
              description="Financial data demands bank-grade paranoia. PayPilot is read-only, encrypted end to end, and auditable by default."
            />

            <Reveal delay={0.2} className="mt-8">
              <div className="flex flex-wrap gap-2.5">
                {BADGES.map((badge) => (
                  <span
                    key={badge}
                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs text-(--pp-dim) shadow-[0_0_0_1px_var(--pp-line)]"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-(--pp-blue)" />
                    {badge}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;

              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`pp-card p-5 ${
                    i === PILLARS.length - 1 ? "sm:col-span-2" : ""
                  }`}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-(--pp-blue-soft)">
                    <Icon className="h-4.5 w-4.5 text-(--pp-blue)" />
                  </span>
                  <h3 className="mt-3.5 text-sm font-medium text-(--pp-ink)">{pillar.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-(--pp-dim)">
                    {pillar.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
