"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { EASE_OUT_EXPO, Magnetic } from "@/components/landing/motion-primitives";

function HeadlineLine({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <span className="block overflow-hidden pb-1">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: 0.15 + index * 0.12, ease: EASE_OUT_EXPO }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Full-viewport hero: full-bleed background, two-column copy + statue visual. */
export function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-(--pp-surface)">
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
        <Image
          src="/hero-bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain object-[center_bottom] scale-105 sm:object-right-bottom lg:scale-100 lg:object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-(--pp-surface) via-(--pp-surface)/90 to-(--pp-surface)/30 lg:bg-gradient-to-r lg:from-(--pp-surface) lg:via-(--pp-surface)/80 lg:to-transparent lg:via-(--pp-surface)/40" />
      </div>

      <div
        aria-hidden
        className="pp-dotgrid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_30%_30%,black,transparent)]"
      />

      <div className="relative z-10 flex w-full flex-col justify-start pt-[4.25rem] pb-6 sm:pt-[4.75rem] sm:pb-8 lg:min-h-screen lg:justify-center lg:pt-24 lg:pb-0">
        <div className="grid lg:grid-cols-2 lg:items-center">
          <div className="relative w-full lg:hidden">
            <div className="relative aspect-[5/4] w-full overflow-hidden sm:aspect-[3/2]">
              <Image
                src="/hero-bg.png"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover object-[72%_bottom] sm:object-[68%_bottom]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-(--pp-surface)" />
            </div>
          </div>

          <div className="px-5 pt-4 pb-6 sm:px-10 sm:pt-6 sm:pb-8 lg:py-16 lg:pl-12 xl:pl-20 2xl:pl-28">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
              className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full bg-white px-3.5 py-1.5 shadow-[0_0_0_1px_var(--pp-line),0_6px_16px_-8px_rgba(29,99,242,0.35)] sm:mb-8 sm:gap-2.5 sm:px-4"
            >
              <span className="pp-pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-(--pp-blue)" />
              <span className="pp-mono text-[9px] leading-tight text-(--pp-dim) sm:text-[10px]">
                Built for Shopify · Made for Indian gateways
              </span>
            </motion.div>

            <h1 className="pp-serif text-[clamp(2.65rem,10.5vw,6.5rem)] font-normal leading-[1.05] text-(--pp-ink) sm:leading-[1.03]">
              <HeadlineLine index={0}>
                Every <em className="text-(--pp-blue)">rupee,</em> reconciled.
              </HeadlineLine>
              <HeadlineLine index={1}>Automatically.</HeadlineLine>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE_OUT_EXPO }}
              className="mt-6 max-w-2xl text-base leading-relaxed text-(--pp-dim) sm:mt-7 sm:text-lg sm:text-xl"
            >
              PayPilot sits between your Shopify store, your payment gateways,
              and your bank — matching every transaction, settlement, and
              refund so your books close themselves.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65, ease: EASE_OUT_EXPO }}
              className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            >
              <Magnetic strength={0.3} className="w-full sm:w-auto">
                <Link
                  href="/app"
                  className="group flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-(--pp-blue) px-7 text-[15px] font-medium text-white shadow-[0_18px_40px_-14px_rgba(29,99,242,0.65)] transition-all duration-300 hover:bg-(--pp-blue-deep) hover:shadow-[0_22px_50px_-14px_rgba(29,99,242,0.75)] sm:inline-flex sm:w-auto"
                >
                  Start reconciling free
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Magnetic>
              <Magnetic strength={0.2} className="w-full sm:w-auto">
                <a
                  href="#how-it-works"
                  className="flex h-12 w-full items-center justify-center rounded-full bg-white px-7 text-[15px] text-(--pp-dim) shadow-[0_0_0_1px_var(--pp-line)] transition-all duration-300 hover:bg-(--pp-blue-tint) hover:text-(--pp-ink) hover:shadow-[0_0_0_1px_var(--pp-line-strong)] sm:inline-flex sm:w-auto"
                >
                  See how it works
                </a>
              </Magnetic>
            </motion.div>
          </div>

          <div
            aria-hidden
            className="hidden lg:block lg:min-h-[calc(100vh-6rem)]"
          />
        </div>
      </div>
    </section>
  );
}
