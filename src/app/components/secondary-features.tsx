"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Image from "next/image";
import { useId } from "react";
import { Container } from "~/app/components/container";
import { cn } from "~/lib/utils";
import { Camera, Image as ImageIcon, Users } from "lucide-react";

interface Feature {
  name: string | React.ReactNode;
  summary: string;
  description: string;
  image: {
    src: string;
    width: number;
    height: number;
  };
  icon: React.ComponentType;
}

const features: Array<Feature> = [
  {
    name: "Advanced Photo Management",
    summary: "Organize and manage your photo collections with powerful tools.",
    description:
      "Keep your photography organized with smart albums, AI-powered tagging, and advanced search capabilities. Find any photo instantly and maintain a professional workflow.",
    image: {
      src: "/images/screenshots/organization.png",
      width: 844,
      height: 482,
    },
    icon: function CameraIcon() {
      return <Camera className="h-6 w-6 text-white" />;
    },
  },
  {
    name: "Client Galleries",
    summary: "Create beautiful galleries for your clients with easy sharing.",
    description:
      "Share private galleries with clients, enable easy photo selection, and collect feedback efficiently. Make your client delivery process smooth and professional.",
    image: {
      src: "/images/screenshots/client-access.png",
      width: 844,
      height: 482,
    },
    icon: function GalleryIcon() {
      return <ImageIcon className="h-6 w-6 text-white" />;
    },
  },
  {
    name: "Client Management",
    summary: "Manage your photography clients and projects in one place.",
    description:
      "Keep track of all your photography clients, projects, and communications in a centralized system. Streamline your workflow and deliver exceptional service.",
    image: {
      src: "/images/screenshots/clients.png",
      width: 844,
      height: 482,
    },
    icon: function ClientsIcon() {
      return <Users className="h-6 w-6 text-white" />;
    },
  },
];

function Feature({
  feature,
  isActive,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  feature: Feature;
  isActive: boolean;
}) {
  return (
    <div
      className={cn(className, !isActive && "opacity-75 hover:opacity-100")}
      {...props}
    >
      <div
        className={cn(
          "w-9 rounded-lg p-1.5",
          isActive ? "bg-blue-600" : "bg-slate-500",
        )}
      >
        <feature.icon />
      </div>
      <h3
        className={cn(
          "mt-6 text-sm font-medium",
          isActive ? "text-blue-600" : "text-slate-600",
        )}
      >
        {feature.name}
      </h3>
      <p className="font-display mt-2 text-xl text-slate-900">
        {feature.summary}
      </p>
      <p className="mt-4 text-sm text-slate-600">{feature.description}</p>
    </div>
  );
}

function FeaturesMobile() {
  return (
    <div className="-mx-4 mt-20 flex flex-col gap-y-10 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:hidden">
      {features.map((feature) => (
        <div key={feature.summary}>
          <Feature feature={feature} className="mx-auto max-w-2xl" isActive />
          <div className="relative mt-10 pb-10">
            <div className="absolute -inset-x-4 bottom-0 top-8 bg-slate-200 sm:-inset-x-6" />
            <div className="relative mx-auto w-[52.75rem] overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-500/10">
              <Image
                className="w-full"
                src={feature.image.src}
                width={feature.image.width}
                height={feature.image.height}
                alt=""
                sizes="52.75rem"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeaturesDesktop() {
  return (
    <TabGroup className="hidden lg:mt-20 lg:block">
      {({ selectedIndex }) => (
        <>
          <TabList className="grid grid-cols-3 gap-x-8">
            {features.map((feature, featureIndex) => (
              <Feature
                key={feature.summary}
                feature={{
                  ...feature,
                  name: (
                    <Tab className="ui-not-focus-visible:outline-none">
                      <span className="absolute inset-0" />
                      {feature.name}
                    </Tab>
                  ),
                }}
                isActive={featureIndex === selectedIndex}
                className="relative"
              />
            ))}
          </TabList>
          <TabPanels className="rounded-4xl relative mt-20 overflow-hidden bg-slate-200 px-14 py-16 xl:px-16">
            <div className="-mx-5 flex">
              {features.map((feature, featureIndex) => (
                <TabPanel
                  static
                  key={feature.summary}
                  className={cn(
                    "ui-not-focus-visible:outline-none px-5 transition duration-500 ease-in-out",
                    featureIndex !== selectedIndex && "opacity-60",
                  )}
                  style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
                  aria-hidden={featureIndex !== selectedIndex}
                >
                  <div className="w-[52.75rem] overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-500/10">
                    <Image
                      className="w-full"
                      src={feature.image}
                      alt=""
                      sizes="52.75rem"
                    />
                  </div>
                </TabPanel>
              ))}
            </div>
            <div className="rounded-4xl pointer-events-none absolute inset-0 ring-1 ring-inset ring-slate-900/10" />
          </TabPanels>
        </>
      )}
    </TabGroup>
  );
}

export function SecondaryFeatures() {
  return (
    <section
      id="secondary-features"
      aria-label="Features for managing your photography"
      className="pb-14 pt-20 sm:pb-20 sm:pt-32 lg:pb-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
            Professional tools for photographers
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            Everything you need to manage your photography business efficiently
            and deliver exceptional service to your clients.
          </p>
        </div>
        <FeaturesMobile />
        <FeaturesDesktop />
      </Container>
    </section>
  );
}
