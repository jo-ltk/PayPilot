import Image from "next/image";

import { CountUp, Reveal } from "@/components/landing/motion-primitives";

const STATS = [
  { value: 412, suffix: " Cr+", prefix: "₹", label: "Reconciled every month", decimals: 0 },
  { value: 99.2, suffix: "%", prefix: "", label: "Auto-match accuracy", decimals: 1 },
  { value: 14, suffix: " hrs", prefix: "", label: "Saved per week, per store", decimals: 0 },
  { value: 2400, suffix: "+", prefix: "", label: "Shopify stores onboard", decimals: 0 },
] as const;

/** Full-width band of animated proof-point counters over an editorial backdrop. */
export function StatsSection() {
  return (
    <section className="relative overflow-hidden border-y border-(--pp-line) py-20 sm:py-28">
      <Image
        src="https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2400&auto=format&fit=crop"
        alt="Finance team reviewing numbers together around a laptop"
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#0b1730]/95 via-[#0e1d3d]/88 to-[#0b1730]/95"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-(--pp-blue) opacity-25 blur-[130px]"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <p className="pp-mono text-[11px] font-medium text-white/60">
            Trusted where it counts
          </p>
          <p className="pp-display mt-3 text-2xl font-medium text-white sm:text-3xl">
            The numbers behind the numbers
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="text-center">
              <p className="pp-display text-4xl font-medium text-white sm:text-5xl lg:text-6xl">
                <CountUp
                  to={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </p>
              <p className="pp-mono mt-3 text-[10px] text-white/50">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
