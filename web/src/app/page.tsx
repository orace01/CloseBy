import { BeforeAfter, Marquee } from "@/components/landing/story";
import { Faq, PilotCta, SiteFooter } from "@/components/landing/closing";
import { Features } from "@/components/landing/features";
import { SiteHeader } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingMotion, MotionBootstrap } from "@/components/landing/motion";
import { Transparency } from "@/components/landing/transparency";
import { Pricing, Responsible } from "@/components/landing/trust-pricing";
import { UseCases } from "@/components/landing/use-cases";

export default function HomePage() {
  return (
    <>
      <MotionBootstrap />
      <SiteHeader />
      <main>
        <Hero />
        <Marquee />
        <BeforeAfter />
        <HowItWorks />
        <Transparency />
        <Features />
        <UseCases />
        <Responsible />
        <Pricing />
        <Faq />
        <PilotCta />
      </main>
      <SiteFooter />
      <LandingMotion />
    </>
  );
}
