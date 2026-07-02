import { Reveal } from "@/components/landing/motion-primitives";
import { SectionHeading } from "@/components/landing/section-heading";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const ROW_A: Testimonial[] = [
  {
    quote:
      "We found ₹3.8 lakhs in missing settlements in the first week. PayPilot paid for itself before the trial ended.",
    name: "Ananya Rao",
    role: "Founder, Kaya Botanics",
    initials: "AR",
  },
  {
    quote:
      "Month-end used to take our accountant four days of VLOOKUPs. Now it's a twenty-minute review of flagged items.",
    name: "Pratik Khanna",
    role: "CFO, UrbanNest Living",
    initials: "PK",
  },
  {
    quote:
      "The first tool that actually understands Indian gateways — MDR, GST on fees, T+2 cycles, UTR matching. All of it.",
    name: "Sneha Menon",
    role: "Finance Lead, Trove Apparel",
    initials: "SM",
  },
];

const ROW_B: Testimonial[] = [
  {
    quote:
      "Our refund leakage dropped to zero. If a gateway misses a refund, PayPilot catches it the same day.",
    name: "Dev Verma",
    role: "Ops Head, Solstice Gear",
    initials: "DV",
  },
  {
    quote:
      "I stopped trusting my gateway dashboard numbers years ago. PayPilot's reconciled analytics are the ones I take to investors.",
    name: "Meera Iyer",
    role: "CEO, Fig & Clove",
    initials: "MI",
  },
  {
    quote:
      "Setup took eleven minutes. It reconciled fourteen months of history overnight and flagged 43 mismatches we never knew about.",
    name: "Rohan Shetty",
    role: "Founder, Coastline Co.",
    initials: "RS",
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="pp-card flex w-[19rem] shrink-0 flex-col p-6 sm:w-96">
      <blockquote className="text-sm leading-relaxed text-(--pp-dim)">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-auto pt-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--pp-blue-soft) text-[10px] font-semibold text-(--pp-blue-deep)">
          {testimonial.initials}
        </span>
        <div>
          <p className="text-sm font-medium text-(--pp-ink)">{testimonial.name}</p>
          <p className="text-[11px] text-(--pp-faint)">{testimonial.role}</p>
        </div>
      </figcaption>
    </figure>
  );
}

function MarqueeRow({
  items,
  direction,
  duration,
}: {
  items: Testimonial[];
  direction?: "reverse";
  duration: string;
}) {
  return (
    <div className="pp-marquee-mask-cards">
      <div
        className="pp-marquee-track flex w-max items-stretch gap-4 pr-4 hover:[animation-play-state:paused]"
        data-direction={direction}
        style={{ ["--pp-marquee-duration" as string]: duration }}
      >
        {[...items, ...items, ...items, ...items].map((testimonial, i) => (
          <TestimonialCard key={`${testimonial.initials}-${i}`} testimonial={testimonial} />
        ))}
      </div>
    </div>
  );
}

/** Dual-direction testimonial marquee; rows pause on hover. */
export function TestimonialsSection() {
  return (
    <section className="relative overflow-x-clip py-24 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          align="center"
          eyebrow="Loved by finance teams"
          title={
            <>
              The people who close the books,
              <span className="pp-grad-text"> sleep better</span>
            </>
          }
        />
      </div>

      <Reveal delay={0.15} className="mt-14 space-y-6 pb-8 sm:space-y-8 sm:pb-10">
        <MarqueeRow items={ROW_A} duration="48s" />
        <MarqueeRow items={ROW_B} direction="reverse" duration="56s" />
      </Reveal>
    </section>
  );
}
