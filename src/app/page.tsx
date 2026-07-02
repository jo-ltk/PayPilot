import type { Metadata } from "next";

import { BentoSection } from "@/components/landing/bento-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FlowSection } from "@/components/landing/flow-section";
import { HeroPreviewSection } from "@/components/landing/hero-preview-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HeroTrustSection } from "@/components/landing/hero-trust-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import { PaperPlane } from "@/components/landing/paper-plane";
import { SecuritySection } from "@/components/landing/security-section";
import { ShowcaseSection } from "@/components/landing/showcase-section";
import { StatsSection } from "@/components/landing/stats-section";
import { StorySection } from "@/components/landing/story-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { resolveDashboardHref } from "@/lib/app-entry";
import { getCurrentSession } from "@/lib/auth/require-shop-access";

export const metadata: Metadata = {
  title: "PayPilot — Every rupee, reconciled. Automatically.",
  description:
    "Payment analytics and settlement reconciliation for Shopify merchants. Match every transaction, settlement, and refund across your gateways — automatically.",
};

/** PayPilot marketing landing page. */
export default async function LandingPage() {
  const session = await getCurrentSession();
  const dashboardHref = resolveDashboardHref(session);

  return (
    <div className="pp-landing pp-noise relative min-h-screen overflow-x-clip">
      <LandingNav dashboardHref={dashboardHref} />
      <main>
        <HeroSection dashboardHref={dashboardHref} />
        <HeroTrustSection />
        <HeroPreviewSection />
        <ShowcaseSection />
        <FlowSection />
        <StorySection />
        <BentoSection />
        <StatsSection />
        <TestimonialsSection />
        <SecuritySection />
        <FaqSection />
        <CtaSection dashboardHref={dashboardHref} />
      </main>
      <LandingFooter />
      <PaperPlane />
    </div>
  );
}
