import { CallToAction } from "~/app/components/CallToAction";
import { Faqs } from "~/app/components/Faqs";
import { Footer } from "~/app/components/Footer";
import { Header } from "~/app/components/Header";
import { Hero } from "~/app/components/Hero";
import { Pricing } from "~/app/components/Pricing";
import { PrimaryFeatures } from "~/app/components/PrimaryFeatures";
import { SecondaryFeatures } from "~/app/components/SecondaryFeatures";
import { Testimonials } from "~/app/components/Testimonials";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PrimaryFeatures />
        <SecondaryFeatures />
        <CallToAction />
        <Testimonials />
        <Pricing />
        <Faqs />
      </main>
      <Footer />
    </>
  );
}
