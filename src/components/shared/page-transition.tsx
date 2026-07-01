"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import {
  pageTransitionVariants,
  reducedMotionTransition,
} from "@/lib/animations";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/** Framer Motion wrapper for subtle page enter transitions. */
export function PageTransition({ children, className }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransitionVariants}
      transition={prefersReducedMotion ? reducedMotionTransition : undefined}
    >
      {children}
    </motion.div>
  );
}
