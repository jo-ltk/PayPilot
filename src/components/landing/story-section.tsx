import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

import { Reveal } from "@/components/landing/motion-primitives";
import { SectionHeading } from "@/components/landing/section-heading";

const PROOF_POINTS = [
  "Every gateway, one reconciled ledger",
  "Fee leakage surfaced to the paise",
  "Month-end close in minutes, not days",
] as const;

function StoryCollage() {
  return (
    <div className="relative mx-auto max-w-lg lg:max-w-none">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_0_0_1px_var(--pp-line),0_30px_60px_-24px_rgba(22,35,60,0.35)]">
        <Image
          src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1600&auto=format&fit=crop"
          alt="Merchant accepting a card payment at a modern point of sale"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-(--pp-blue-deep)/35 via-transparent to-transparent"
        />
      </div>

      <div className="absolute -bottom-8 -left-4 w-40 overflow-hidden rounded-2xl shadow-[0_0_0_1px_var(--pp-line),0_22px_45px_-18px_rgba(22,35,60,0.45)] sm:-left-8 sm:w-52">
        <div className="relative aspect-[4/3]">
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop"
            alt="Analytics dashboard with revenue charts on a laptop screen"
            fill
            sizes="(max-width: 640px) 160px, 208px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="absolute -top-5 right-4 flex items-center gap-2.5 rounded-full bg-white/90 px-4 py-2.5 shadow-[0_0_0_1px_var(--pp-line),0_14px_30px_-12px_rgba(29,99,242,0.4)] backdrop-blur sm:-right-4">
        <span className="pp-pulse-dot h-1.5 w-1.5 rounded-full bg-(--pp-blue)" />
        <span className="pp-mono text-[10px] text-(--pp-dim)">
          Settlement matched · UTR verified
        </span>
      </div>
    </div>
  );
}

/** Editorial split band: merchant story copy beside a layered image collage. */
export function StorySection() {
  return (
    <section className="relative py-24 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Built for modern commerce"
              title={
                <>
                  Behind every checkout,
                  <span className="pp-grad-text"> a team closing books</span>
                </>
              }
              description="PayPilot was built for the founders, finance leads, and ops teams who keep Indian e-commerce running — the people who deserve better than a wall of gateway CSVs."
            />
            <Reveal delay={0.2}>
              <ul className="mt-8 space-y-3.5">
                {PROOF_POINTS.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-sm text-(--pp-dim)">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-(--pp-blue)" />
                    {point}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <StoryCollage />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
