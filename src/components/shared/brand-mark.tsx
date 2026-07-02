import Link from "next/link";

import { cn } from "@/lib/utils";

interface BrandMarkProps {
  href?: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

/** Shared PayPilot logo mark used across marketing and app shells. */
export function BrandMark({ href, subtitle, className, onClick }: BrandMarkProps) {
  const content = (
    <>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--retro-chart-strong,#1d63f2)] shadow-[0_6px_18px_-6px_rgba(29,99,242,0.75),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-300 group-hover:scale-[1.04]">
        <span className="font-retro text-sm font-semibold text-white">P</span>
        <span className="absolute inset-0 rounded-full bg-linear-to-br from-white/30 via-transparent to-transparent" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate font-retro text-xl font-medium tracking-tight text-foreground">
          PayPilot
        </span>
        {subtitle ? (
          <span className="truncate text-xs font-medium text-muted-foreground">{subtitle}</span>
        ) : null}
      </div>
    </>
  );

  const rootClassName = cn("group flex min-w-0 items-center gap-3", className);

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={rootClassName} aria-label="Back to homepage">
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={rootClassName} aria-label="PayPilot home">
        {content}
      </button>
    );
  }

  return <div className={rootClassName}>{content}</div>;
}
