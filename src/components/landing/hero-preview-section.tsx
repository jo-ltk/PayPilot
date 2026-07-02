"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { HeroDashboard } from "@/components/landing/hero-dashboard";
import { EASE_OUT_EXPO } from "@/components/landing/motion-primitives";

/** Product preview band below the hero — dashboard mock with parallax scroll. */
export function HeroPreviewSection() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const previewY = useTransform(scrollYProgress, [0, 0.5], [60, -30]);

  return (
    <section
      ref={ref}
      id="showcase-preview"
      className="relative z-20 bg-(--pp-bg) pb-16 pt-6 sm:pb-20 sm:pt-8"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 xl:px-20 2xl:px-28">
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
          style={{ y: reduced ? 0 : previewY }}
        >
          <HeroDashboard />
        </motion.div>
      </div>
    </section>
  );
}
