"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "~/lib/utils";

const features = [
  {
    title: "Beautiful Galleries",
    description:
      "Create responsive, customizable galleries that showcase your work in the best light.",
    image: "/gallery-preview.jpg",
  },
  {
    title: "Smart Organization",
    description:
      "Organize photos with intelligent albums, tags, and AI-powered categorization.",
    image: "/organization-preview.jpg",
  },
  {
    title: "Client Access",
    description:
      "Share private galleries with clients and collect feedback efficiently.",
    image: "/client-preview.jpg",
  },
];

export function GalleryFeatures() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section
      id="features"
      aria-label="Features for photo management"
      className="relative overflow-hidden bg-neutral-900 pb-28 pt-20 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl md:mx-auto md:text-center xl:max-w-none">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
            Your photos, beautifully organized
          </h2>
          <p className="mt-6 text-lg tracking-tight text-neutral-300">
            Powerful tools to manage, organize, and showcase your photography
            portfolio.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 items-center gap-y-2 pt-10 sm:gap-y-6 md:mt-20 lg:grid-cols-12 lg:pt-0">
          <div className="-mx-4 flex overflow-x-auto pb-4 sm:mx-0 sm:overflow-visible sm:pb-0 lg:col-span-5">
            <div className="relative z-10 flex gap-x-4 whitespace-nowrap px-4 sm:mx-auto sm:px-0 lg:mx-0 lg:block lg:gap-x-0 lg:gap-y-1 lg:whitespace-normal">
              {features.map((feature, featureIndex) => (
                <button
                  key={feature.title}
                  className={cn(
                    "group relative rounded-full px-4 py-1 lg:rounded-l-xl lg:rounded-r-none lg:p-6",
                    activeFeature === featureIndex
                      ? "bg-white lg:bg-white/10 lg:ring-1 lg:ring-inset lg:ring-white/10"
                      : "hover:bg-white/10 lg:hover:bg-white/5",
                  )}
                  onClick={() => setActiveFeature(featureIndex)}
                >
                  <h3>
                    <span className="font-display text-lg text-white [&:not(:focus-visible)]:focus:outline-none">
                      <span className="absolute inset-0 rounded-full lg:rounded-l-xl lg:rounded-r-none" />
                      {feature.title}
                    </span>
                  </h3>
                  <p
                    className={cn(
                      "mt-2 hidden text-sm text-neutral-300 lg:block",
                      activeFeature === featureIndex
                        ? "text-white"
                        : "group-hover:text-white",
                    )}
                  >
                    {feature.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="relative">
              {features.map(
                (feature, featureIndex) =>
                  activeFeature === featureIndex && (
                    <div
                      key={feature.title}
                      className="relative overflow-hidden rounded-xl bg-neutral-50"
                    >
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        width={800}
                        height={500}
                        className="w-full object-cover"
                      />
                    </div>
                  ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
