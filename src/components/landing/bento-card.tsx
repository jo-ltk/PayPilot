"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";

interface BentoCardProps {
  icon: LucideIcon;
  title: string;
  body: string;
  className?: string;
  children?: ReactNode;
}

/** Bento tile with a cursor-tracked spotlight and hover lift. */
export function BentoCard({ icon: Icon, title, body, className, children }: BentoCardProps) {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, rgba(29,99,242,0.08), transparent 75%)`;

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set(event.clientX - rect.left);
    my.set(event.clientY - rect.top);
  }

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={() => {
        mx.set(-200);
        my.set(-200);
      }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`pp-card group relative flex flex-col overflow-hidden p-6 sm:p-7 ${className ?? ""}`}
    >
      <motion.div
        aria-hidden
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative flex h-full flex-col">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--pp-blue-soft) text-(--pp-blue)">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <h3 className="pp-display mt-5 text-lg font-medium text-(--pp-ink) sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-(--pp-dim)">{body}</p>
        {children ? <div className="mt-auto pt-6">{children}</div> : null}
      </div>
    </motion.div>
  );
}
