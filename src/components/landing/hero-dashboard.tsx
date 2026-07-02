"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";

const BARS = [42, 58, 45, 70, 52, 84, 66, 92, 74, 100, 88, 96];

const FEED = [
  { id: "#TXN-8493", label: "UPI · Razorpay", amount: "+₹12,450", matched: true },
  { id: "#TXN-8494", label: "Card · PayU", amount: "+₹4,299", matched: true },
  { id: "#RFD-1102", label: "Refund · Shopify", amount: "−₹1,850", matched: false },
  { id: "#TXN-8495", label: "Netbanking · Razorpay", amount: "+₹28,999", matched: true },
  { id: "#STL-0284", label: "Settlement · HDFC", amount: "+₹2,41,304", matched: true },
];

function useLiveIndex(length: number, intervalMs: number) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % length), intervalMs);
    return () => clearInterval(timer);
  }, [length, intervalMs]);

  return index;
}

function FeedRow({ item, highlight }: { item: (typeof FEED)[number]; highlight: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs transition-colors duration-500 ${
        highlight
          ? "border-(--pp-blue)/40 bg-(--pp-blue-soft)"
          : "border-(--pp-line) bg-white"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full ${
            item.amount.startsWith("−")
              ? "bg-(--pp-surface) text-(--pp-faint)"
              : "bg-(--pp-blue-soft) text-(--pp-blue)"
          }`}
        >
          {item.amount.startsWith("−") ? (
            <ArrowDownLeft className="h-3 w-3" />
          ) : (
            <ArrowUpRight className="h-3 w-3" />
          )}
        </span>
        <div>
          <p className="font-medium text-(--pp-ink)">{item.id}</p>
          <p className="text-[10px] text-(--pp-faint)">{item.label}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-(--pp-ink)">{item.amount}</span>
        {item.matched ? <CheckCircle2 className="h-3.5 w-3.5 text-(--pp-blue-bright)" /> : null}
      </div>
    </motion.div>
  );
}

/** Hero product preview: cursor-tilted glass dashboard with a live feed. */
export function HeroDashboard() {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-9, 9]), { stiffness: 120, damping: 20 });
  const liveIndex = useLiveIndex(FEED.length, 2200);

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (reduced) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width);
    my.set((event.clientY - rect.top) / rect.height);
  }

  return (
    <div style={{ perspective: 1400 }} onMouseMove={handleMove} onMouseLeave={() => { mx.set(0.5); my.set(0.5); }}>
      <motion.div
        style={{ rotateX: reduced ? 0 : rotateX, rotateY: reduced ? 0 : rotateY, transformStyle: "preserve-3d" }}
        className="pp-glass relative rounded-3xl p-4 sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div
            className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-(--pp-blue)/6 to-transparent"
            style={{ animation: reduced ? "none" : "pp-scanline 5s linear infinite" }}
          />
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-(--pp-line)" />
            <span className="h-2.5 w-2.5 rounded-full bg-(--pp-line)" />
            <span className="h-2.5 w-2.5 rounded-full bg-(--pp-blue)" />
          </div>
          <div className="flex items-center gap-2 rounded-full border border-(--pp-line) bg-white px-3 py-1">
            <span className="pp-pulse-dot h-1.5 w-1.5 rounded-full bg-(--pp-blue)" />
            <span className="pp-mono text-[9px] text-(--pp-dim)">Live sync</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-[1.25fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-(--pp-line) bg-white p-4">
              <p className="pp-mono text-[9px] text-(--pp-faint)">Gross volume · 30d</p>
              <p className="pp-display mt-1.5 text-3xl font-medium text-(--pp-ink)">₹48,20,140</p>
              <p className="mt-1 text-[11px] font-medium text-(--pp-blue)">↑ 23.4% vs last month</p>
              <div className="mt-4 flex h-20 items-end gap-1.5">
                {BARS.map((height, i) => (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.6 + i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: `${height}%`, transformOrigin: "bottom" }}
                    className={`flex-1 rounded-t-sm ${
                      i === BARS.length - 3 ? "bg-(--pp-blue)" : "bg-(--pp-blue-soft)"
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Match rate", value: "99.2%" },
                { label: "Unreconciled", value: "₹8,412" },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border border-(--pp-line) bg-white p-4">
                  <p className="pp-mono text-[9px] text-(--pp-faint)">{kpi.label}</p>
                  <p className="pp-display mt-1 text-xl font-medium text-(--pp-ink)">{kpi.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="pp-mono text-[9px] text-(--pp-faint)">Reconciliation feed</p>
            {FEED.map((item, i) => (
              <FeedRow key={item.id} item={item} highlight={i === liveIndex} />
            ))}
          </div>
        </div>

        <motion.div
          style={{ transform: "translateZ(60px)" }}
          className="pp-float absolute -right-4 -top-5 hidden items-center gap-2 rounded-2xl border border-(--pp-blue)/25 bg-white px-4 py-3 shadow-[0_20px_50px_-15px_rgba(29,99,242,0.5)] sm:flex"
        >
          <CheckCircle2 className="h-4 w-4 text-(--pp-blue-bright)" />
          <div>
            <p className="text-xs font-medium text-(--pp-ink)">Settlement matched</p>
            <p className="text-[10px] text-(--pp-faint)">1,284 orders · 0 discrepancies</p>
          </div>
        </motion.div>

        <motion.div
          style={{ transform: "translateZ(40px)", ["--pp-float-duration" as string]: "7.5s" }}
          className="pp-float absolute -bottom-5 -left-4 hidden rounded-2xl border border-(--pp-line) bg-white px-4 py-3 shadow-[0_20px_50px_-18px_rgba(29,99,242,0.4)] sm:block"
        >
          <p className="pp-mono text-[9px] text-(--pp-faint)">Next payout · HDFC ****4210</p>
          <p className="pp-display mt-0.5 text-lg font-medium text-(--pp-ink)">
            ₹2,41,304 <span className="text-[11px] font-normal text-(--pp-blue-bright)">in 2 days</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
