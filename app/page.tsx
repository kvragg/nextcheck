import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { HowItWorks, Coverage, FAQ, CTA } from "@/components/Sections";
import { AuditSection } from "@/components/AuditSection";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="pt-14">
        <Hero />
        <HowItWorks />
        <Coverage />
        <AuditSection />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
