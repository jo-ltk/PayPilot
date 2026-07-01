import type { Variants } from "framer-motion";

/** Fade and slight upward motion for page transitions. */
export const pageTransitionVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/** Respects reduced motion preferences in consuming components. */
export const reducedMotionTransition = {
  duration: 0,
};

/** Staggered entrance for KPI card grids. */
export const kpiGridVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

/** Single KPI card entrance animation. */
export const kpiCardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

/** Fade-in for chart containers. */
export const chartFadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

/** Staggered list for activity timelines. */
export const listStaggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

/** Single activity row entrance animation. */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

/** Toolbar filter row entrance animation. */
export const filterToolbarVariants: Variants = {
  hidden: { opacity: 0, y: -4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

/** Table body fade-in while data loads. */
export const tableBodyVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

/** Drawer content slide-in from the right. */
export const drawerContentVariants: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

/** Dialog content fade and scale entrance. */
export const dialogContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

/** Settings tab panel entrance animation. */
export const settingsPanelVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: "easeOut" },
  },
};

/** Save button success pulse animation. */
export const saveSuccessVariants: Variants = {
  idle: { scale: 1 },
  saved: {
    scale: [1, 1.04, 1],
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

