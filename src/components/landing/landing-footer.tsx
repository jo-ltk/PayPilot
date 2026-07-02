import Link from "next/link";

import { BrandMark } from "@/components/shared/brand-mark";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Transactions", href: "#features" },
      { label: "Settlements", href: "#features" },
      { label: "Reconciliation", href: "#features" },
      { label: "Analytics", href: "#features" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Docs", href: "#" },
      { label: "API reference", href: "#" },
      { label: "Gateway guides", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#security" },
      { label: "DPA", href: "#" },
    ],
  },
] as const;

/** Marketing footer with sitemap columns and a live status pulse. */
export function LandingFooter() {
  return (
    <footer className="relative border-t border-(--pp-line) bg-(--pp-surface)">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <BrandMark href="/" className="text-(--pp-ink)" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-(--pp-dim)">
              Payment analytics and settlement reconciliation for Shopify
              merchants who take their numbers seriously.
            </p>
            <div className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2 shadow-[0_0_0_1px_var(--pp-line)]">
              <span className="pp-pulse-dot h-1.5 w-1.5 rounded-full bg-(--pp-blue)" />
              <span className="pp-mono text-[9px] text-(--pp-dim)">
                All systems reconciled
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <h3 className="pp-mono text-[10px] text-(--pp-faint)">{column.heading}</h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-(--pp-dim) transition-colors duration-200 hover:text-(--pp-blue)"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-(--pp-line) pt-8 sm:flex-row">
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
