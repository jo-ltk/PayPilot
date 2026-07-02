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
      className="group flex min-w-0 shrink-0 cursor-pointer items-center gap-2 select-none sm:gap-2.5"
      aria-label="PayPilot home"
    >
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--pp-blue) shadow-[0_6px_18px_-6px_rgba(29,99,242,0.75),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-300 group-hover:scale-[1.04] sm:h-9 sm:w-9">
        <span className="pp-display text-[13px] font-semibold text-white sm:text-sm">P</span>
        <span className="absolute inset-0 rounded-full bg-linear-to-br from-white/30 via-transparent to-transparent" />
      </span>
      <span className="pp-display text-base font-medium tracking-tight whitespace-nowrap text-(--pp-ink) sm:text-lg">
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

/** Slide-in mobile sidebar drawer. */
function MobileNavSidebar({
  open,
  onClose,
  dashboardHref,
}: {
  open: boolean;
  onClose: () => void;
  dashboardHref: string;
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
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[60] bg-(--pp-ink)/25 backdrop-blur-[2px] lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.34, ease: EASE_OUT_EXPO }}
            className="pp-nav-sidebar fixed inset-y-0 right-0 z-[70] flex w-[min(88vw,19rem)] flex-col border-l lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between border-b border-white/50 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--pp-blue) text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(29,99,242,0.75)]">
                  P
                </span>
                <span className="pp-display text-base font-medium text-(--pp-ink)">PayPilot</span>
              </div>
              <button
                type="button"
                aria-label="Close menu"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/45 bg-white/35 text-(--pp-ink) shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] transition-colors hover:bg-white/55"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
              {LINKS.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.24 }}
                  className="rounded-xl border-l-2 border-transparent px-4 py-3.5 text-[16px] font-medium text-(--pp-dim) transition-colors hover:border-(--pp-blue) hover:bg-white/50 hover:text-(--pp-ink)"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <div className="space-y-2 border-t border-white/50 p-4">
              <Link
                href="/login"
                onClick={onClose}
                className="flex h-11 items-center justify-center rounded-xl border border-white/50 bg-white/30 text-[15px] font-medium text-(--pp-ink) transition-colors hover:bg-white/50"
              >
                Sign in
              </Link>
              <Link
                href={dashboardHref}
                onClick={onClose}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--pp-blue)/95 px-4 text-[15px] font-medium whitespace-nowrap text-white shadow-[0_10px_24px_-10px_rgba(29,99,242,0.7),inset_0_1px_0_rgba(255,255,255,0.2)]"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.aside>
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

        <div className="relative z-10 flex w-full min-w-0 items-center justify-between gap-2 sm:gap-3">
          <NavLogo onLogoClick={handleLogoClick} />

          <DesktopNavLinks />

          <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <Link
              href="/login"
              className="hidden rounded-full px-3 py-1.5 text-[13px] font-medium text-(--pp-dim) transition-all duration-200 hover:bg-white/40 hover:text-(--pp-ink) hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] md:block"
            >
              Sign in
            </Link>

            <Magnetic strength={0.35} className="hidden sm:inline-block">
              <Link
                href={dashboardHref}
                className="group inline-flex h-9 items-center gap-2 rounded-full bg-(--pp-blue)/95 px-4 text-[13px] font-medium whitespace-nowrap text-white shadow-[0_10px_28px_-10px_rgba(29,99,242,0.75),inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm transition-all duration-300 hover:bg-(--pp-blue-deep) hover:shadow-[0_14px_36px_-10px_rgba(29,99,242,0.9),inset_0_1px_0_rgba(255,255,255,0.3)]"
              >
                Get started
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/20">
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Magnetic>

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
      </motion.div>

      <MobileNavSidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        dashboardHref={dashboardHref}
      />
    </header>
  );
}
