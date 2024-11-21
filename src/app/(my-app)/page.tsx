import { CallToAction } from "~/app/(my-app)/components/call-to-action";
import { Faqs } from "~/app/(my-app)/components/faqs";
import { Footer } from "~/app/(my-app)/components/footer";
import { GalleryFeatures } from "~/app/(my-app)/components/gallery-features";
import { Header } from "~/app/(my-app)/components/header";
import { Hero } from "~/app/(my-app)/components/hero";
import { Pricing } from "~/app/(my-app)/components/pricing";
import { PrimaryFeatures } from "~/app/(my-app)/components/primary-features";
import { SecondaryFeatures } from "~/app/(my-app)/components/secondary-features";
import { Testimonials } from "~/app/(my-app)/components/testimonials";

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
