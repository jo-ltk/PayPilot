"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import {
  reducedMotionTransition,
  settingsPanelVariants,
} from "@/lib/animations";

interface SettingsTabPanelProps {
  children: ReactNode;
  className?: string;
}

/** Animated wrapper for settings tab content panels. */
export function SettingsTabPanel({ children, className }: SettingsTabPanelProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={settingsPanelVariants}
      initial="hidden"
      animate="visible"
      transition={prefersReducedMotion ? reducedMotionTransition : undefined}
    >
      {children}
    </motion.div>
  );
}
