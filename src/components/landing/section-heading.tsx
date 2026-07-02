import type { ReactNode } from "react";

import { Reveal } from "@/components/landing/motion-primitives";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
}

/** Shared marketing section header: mono eyebrow, display title, dim copy. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignment =
    align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col gap-5 ${alignment}`}>
      <Reveal>
        <p className="pp-mono flex items-center gap-2.5 text-[11px] font-medium text-(--pp-blue)">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-(--pp-blue)" />
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="pp-display max-w-3xl text-4xl font-medium leading-[1.02] text-(--pp-ink) sm:text-5xl lg:text-6xl">
          {title}
        </h2>
      </Reveal>
      {description ? (
        <Reveal delay={0.16}>
          <p className="max-w-xl text-base leading-relaxed text-(--pp-dim) sm:text-lg">
            {description}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
