import { CallToAction } from "~/app/components/call-to-action";
import { Faqs } from "~/app/components/faqs";
import { Footer } from "~/app/components/footer";
import { GalleryFeatures } from "~/app/components/gallery-features";
import { Header } from "~/app/components/header";
import { Hero } from "~/app/components/hero";
import { Pricing } from "~/app/components/pricing";
import { PrimaryFeatures } from "~/app/components/primary-features";
import { SecondaryFeatures } from "~/app/components/secondary-features";
import { Testimonials } from "~/app/components/testimonials";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PrimaryFeatures />
        <SecondaryFeatures />
        <GalleryFeatures />
        <CallToAction />
        <Testimonials />
        <Pricing />
        <Faqs />
      </main>
      <Footer />
    </>
  );
}
