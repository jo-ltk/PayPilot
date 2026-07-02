"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { EASE_OUT_EXPO, Magnetic } from "@/components/landing/motion-primitives";

const LINKS = [
  { label: "Product", href: "#showcase" },
  { label: "Flow", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
] as const;

const LOGO_CLICKS_FOR_EASTER_EGG = 5;

/** Logo mark with hidden paper-plane easter egg. */
function NavLogo({ onLogoClick }: { onLogoClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onLogoClick}
      className="group flex min-w-0 shrink cursor-pointer items-center gap-2 select-none sm:gap-2.5"
      aria-label="PayPilot home"
    >
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--pp-blue) shadow-[0_6px_18px_-6px_rgba(29,99,242,0.75),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-300 group-hover:scale-[1.04] sm:h-9 sm:w-9">
        <span className="pp-display text-[13px] font-semibold text-white sm:text-sm">P</span>
        <span className="absolute inset-0 rounded-full bg-linear-to-br from-white/30 via-transparent to-transparent" />
      </span>
      <span className="pp-display truncate text-base font-medium tracking-tight text-(--pp-ink) sm:text-lg">
        PayPilot
      </span>
    </button>
  );
}

/** Desktop anchor links inside a frosted pill track. */
function DesktopNavLinks() {
  return (
    <div className="pp-nav-track hidden items-center rounded-full p-1 lg:flex">
      {LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-(--pp-dim) transition-all duration-200 hover:bg-white/55 hover:text-(--pp-ink) hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_12px_-6px_rgba(22,35,60,0.2)]"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

/** Slide-down mobile menu panel. */
function MobileNavPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-(--pp-ink)/15 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.28, ease: EASE_OUT_EXPO }}
            className="pp-nav-panel absolute inset-x-0 top-[calc(100%+0.625rem)] z-50 overflow-hidden rounded-2xl p-2 lg:hidden"
          >
            <div className="flex flex-col gap-0.5">
              {LINKS.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.2 }}
                  className="rounded-xl px-4 py-3 text-[15px] font-medium text-(--pp-dim) transition-colors hover:bg-white/45 hover:text-(--pp-ink)"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="my-1 h-px bg-white/50" />
              <Link
                href="/login"
                onClick={onClose}
                className="rounded-xl px-4 py-3 text-[15px] font-medium text-(--pp-dim) transition-colors hover:bg-white/45 hover:text-(--pp-ink)"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

/** Fixed glass navigation bar that condenses on scroll. */
export function LandingNav({ dashboardHref }: { dashboardHref: string }) {
  const { scrollY } = useScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const clicks = useRef(0);

  const shellBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0.28)", "rgba(255, 255, 255, 0.82)"],
  );
  const shellBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255, 255, 255, 0.55)", "rgba(219, 228, 244, 0.85)"],
  );
  const shellShadow = useTransform(
    scrollY,
    [0, 100],
    [
      "inset 0 1px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(255,255,255,0.15), 0 0 0 1px rgba(255,255,255,0.42), 0 8px 32px -12px rgba(29,99,242,0.18)",
      "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(255,255,255,0.2), 0 0 0 1px rgba(219,228,244,0.9), 0 16px 48px -14px rgba(22,35,60,0.22)",
    ],
  );

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleLogoClick() {
    clicks.current += 1;

    if (clicks.current >= LOGO_CLICKS_FOR_EASTER_EGG) {
      clicks.current = 0;
      window.dispatchEvent(new Event("pp:fly"));
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4">
      <motion.div
        style={{
          background: shellBackground,
          borderColor: shellBorder,
          boxShadow: shellShadow,
        }}
        className="pp-nav-shell relative mx-auto flex min-h-[3.35rem] max-w-6xl items-center justify-between gap-2 rounded-[1.125rem] border px-2.5 py-1 sm:min-h-[3.625rem] sm:gap-3 sm:px-4"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white/90 to-transparent"
        />

        <div className="relative z-10 flex w-full items-center justify-between gap-3">
          <NavLogo onLogoClick={handleLogoClick} />

          <DesktopNavLinks />

          <div className="flex items-center gap-2 sm:gap-2.5">
            <Link
              href="/login"
              className="hidden rounded-full px-3 py-1.5 text-[13px] font-medium text-(--pp-dim) transition-all duration-200 hover:bg-white/40 hover:text-(--pp-ink) hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] md:block"
            >
              Sign in
            </Link>

            <Magnetic strength={0.35} className="hidden sm:block">
              <Link
                href={dashboardHref}
                className="group inline-flex h-9 items-center gap-2 rounded-full bg-(--pp-blue)/95 px-4 text-[13px] font-medium text-white shadow-[0_10px_28px_-10px_rgba(29,99,242,0.75),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm transition-all duration-300 hover:bg-(--pp-blue-deep) hover:shadow-[0_14px_36px_-10px_rgba(29,99,242,0.9),inset_0_1px_0_rgba(255,255,255,0.3)]"
              >
                Get started
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/20">
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Magnetic>

            <Link
              href={dashboardHref}
              className="inline-flex h-9 items-center rounded-full bg-(--pp-blue)/95 px-4 text-[13px] font-medium text-white shadow-[0_10px_24px_-10px_rgba(29,99,242,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] sm:hidden"
            >
              Start
            </Link>

            <button
              type="button"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/45 bg-white/25 text-(--pp-ink) shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-sm transition-all hover:bg-white/45 lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <MobileNavPanel open={menuOpen} onClose={() => setMenuOpen(false)} />
      </motion.div>
    </header>
  );
}
