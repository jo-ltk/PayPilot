import Link from "next/link";

const NAV_LINKS = [
  { label: "Transactions", href: "#features" },
  { label: "Settlements", href: "#features" },
  { label: "Reconciliation", href: "#features" },
  { label: "Analytics", href: "#features" },
  { label: "About", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Docs", href: "#" },
  { label: "API", href: "#" },
  { label: "Status", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Security", href: "#security" },
] as const;

/** Compact logo mark matching the landing nav. */
function FooterLogo() {
  return (
    <Link
      href="/"
      className="group flex shrink-0 items-center gap-2 sm:gap-2.5"
      aria-label="PayPilot home"
    >
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--pp-blue) shadow-[0_6px_18px_-6px_rgba(29,99,242,0.75),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-300 group-hover:scale-[1.04] sm:h-9 sm:w-9">
        <span className="pp-display text-[13px] font-semibold text-white sm:text-sm">P</span>
        <span className="absolute inset-0 rounded-full bg-linear-to-br from-white/30 via-transparent to-transparent" />
      </span>
      <span className="pp-display truncate text-base font-medium tracking-tight text-(--pp-ink) sm:text-lg">
        PayPilot
      </span>
    </Link>
  );
}

/** Live status pill shown at the trailing edge of the footer bar. */
function StatusBadge() {
  return (
    <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/45 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_0_0_1px_rgba(255,255,255,0.45)]">
      <span className="pp-pulse-dot h-1.5 w-1.5 rounded-full bg-(--pp-blue)" />
      <span className="pp-mono text-[9px] text-(--pp-dim)">All systems reconciled</span>
    </div>
  );
}

/** Marketing footer styled as a horizontal navbar shell. */
export function LandingFooter() {
  return (
    <footer className="relative px-4 pb-6 pt-4 sm:px-6 sm:pb-8">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="pp-nav-shell relative rounded-[1.125rem] border border-white/55 bg-white/28 px-2.5 py-2 sm:px-4 sm:py-2.5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white/90 to-transparent"
          />

          <div className="relative z-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div className="flex items-center justify-between gap-3 lg:justify-start">
              <FooterLogo />
              <div className="lg:hidden">
                <StatusBadge />
              </div>
            </div>

            <nav
              aria-label="Footer"
              className="pp-nav-track flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto rounded-full p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium text-(--pp-dim) transition-all duration-200 hover:bg-white/55 hover:text-(--pp-ink) hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_12px_-6px_rgba(22,35,60,0.2)] sm:px-3.5 sm:text-[13px]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:block">
              <StatusBadge />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 px-1 sm:flex-row">
          <p className="text-xs text-(--pp-faint)">
            © {new Date().getFullYear()} PayPilot Technologies Pvt. Ltd. All rights reserved.
          </p>
          <p className="pp-mono text-[9px] text-(--pp-faint)">
            Made in India · Press P three times to take flight
          </p>
        </div>
      </div>
    </footer>
  );
}
