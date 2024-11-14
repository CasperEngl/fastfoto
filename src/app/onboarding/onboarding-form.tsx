"use client";

import { defineStepper } from "@stepperize/react";
import {
  Baby,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Check,
  Gem,
  GraduationCap,
  HandHeart,
  Heart,
  Music2,
  PawPrint,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { match } from "ts-pattern";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";
import { saveOnboardingData } from "./actions";
import { ONBOARDING_STEPS, OnboardingData, StudioSize } from "./types";

type PricingTier = {
  name: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
};

const { Scoped, useStepper } = defineStepper(
  {
    id: ONBOARDING_STEPS.STUDIO_SIZE,
    title: "Studio Size",
    description: "How many photographers work in your studio?",
  },
  {
    id: ONBOARDING_STEPS.SPECIALIZATIONS,
    title: "Specializations",
    description: "Select the types of photography your studio offers",
  },
  {
    id: ONBOARDING_STEPS.REVIEW,
    title: "Review",
    description: "Review your selections before completing",
  },
);

function StudioSizeStep({
  data,
  onUpdate,
}: {
  data: OnboardingData;
  onUpdate: (size: StudioSize) => void;
}) {
  return (
    <div className="space-y-4">
      <RadioGroup
        defaultValue={data.studioSize}
        onValueChange={(value) => onUpdate(value as StudioSize)}
        className="grid grid-cols-4 gap-4"
      >
        {[
          {
            value: "SOLO",
            label: "Solo",
            description: "1 photographer",
            icon: <User />,
          },
          {
            value: "SMALL_STUDIO",
            label: "Small",
            description: "2-5 photographers",
            icon: <Users />,
          },
          {
            value: "MEDIUM_STUDIO",
            label: "Medium",
            description: "5-20 photographers",
            icon: <Boxes />,
          },
          {
            value: "LARGE_STUDIO",
            label: "Large",
            description: "20+ photographers",
            icon: <Building2 />,
          },
        ].map(({ value, label, description, icon }) => (
          <div key={value} className="relative">
            <RadioGroupItem value={value} id={value} className="sr-only" />
            <Label htmlFor={value}>
              <Card
                className={cn(
                  "flex h-32 flex-col items-center justify-center gap-y-2 p-4 text-center transition-all hover:bg-accent",
                  { "border-primary bg-accent": data.studioSize === value },
                )}
              >
                <div className="text-muted-foreground">{icon}</div>
                <h3 className="text-lg text-foreground">{label}</h3>
              </Card>

              <p className="mt-2 text-center text-sm text-muted-foreground">
                {description}
              </p>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

function SpecializationsStep({
  data,
  onUpdate,
}: {
  data: OnboardingData;
  onUpdate: (
    category: "portrait" | "events",
    subCategory: string,
    checked: boolean,
  ) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Portrait Photography</h3>
          <div className="grid grid-cols-5 gap-4">
            {[
              {
                label: "Family",
                value: "family",
                description: "Family portraits",
                icon: <HandHeart />,
              },
              {
                label: "Corporate Headshots",
                value: "corporateHeadshots",
                description: "Professional portraits",
                icon: <Building2 />,
              },
              {
                label: "Pets",
                value: "pets",
                description: "Pet photography",
                icon: <PawPrint />,
              },
              {
                label: "Maternity",
                value: "maternity",
                description: "Maternity portraits",
                icon: <Heart />,
              },
              {
                label: "Newborn",
                value: "newborn",
                description: "Newborn photography",
                icon: <Baby />,
              },
            ].map(({ value, label, description, icon }) => (
              <div key={value} className="relative">
                <Checkbox
                  id={`portrait-${value}`}
                  checked={
                    data.specializations.portrait?.[
                      value as keyof typeof data.specializations.portrait
                    ] ?? false
                  }
                  onCheckedChange={(checked) => {
                    onUpdate(
                      "portrait",
                      value,
                      checked === "indeterminate" ? true : checked,
                    );
                  }}
                  className="sr-only"
                />
                <Label htmlFor={`portrait-${value}`}>
                  <Card
                    className={cn(
                      "flex h-32 flex-col items-center justify-center gap-y-2 p-4 text-center transition-all hover:bg-accent",
                      {
                        "border-primary bg-accent":
                          data.specializations.portrait?.[
                            value as keyof typeof data.specializations.portrait
                          ],
                      },
                    )}
                  >
                    <div className="text-muted-foreground">{icon}</div>

                    <h4 className="text-foreground">{label}</h4>
                  </Card>

                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    {description}
                  </p>
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">Event Photography</h3>
          <div className="grid grid-cols-5 gap-4">
            {[
              {
                value: "wedding",
                label: "Wedding",
                icon: <Gem />,
              },
              {
                value: "graduation",
                label: "Graduation",
                icon: <GraduationCap />,
              },
              {
                value: "professionalSporting",
                label: "Professional Sporting",
                icon: <Trophy />,
              },
              {
                value: "dancePerformance",
                label: "Dance/Performance",
                icon: <Music2 />,
              },
              {
                value: "businessEvents",
                label: "Business Events",
                icon: <BriefcaseBusiness />,
              },
            ].map(({ value, label, icon }) => (
              <div key={value} className="relative">
                <Checkbox
                  id={`events-${value}`}
                  checked={
                    data.specializations.events?.[
                      value as keyof typeof data.specializations.events
                    ] ?? false
                  }
                  onCheckedChange={(checked) =>
                    onUpdate("events", value, checked as boolean)
                  }
                  className="sr-only"
                />
                <Label htmlFor={`events-${value}`}>
                  <Card
                    className={cn(
                      "flex h-32 flex-col items-center justify-center gap-y-2 p-4 text-center transition-all hover:bg-accent",
                      {
                        "border-primary bg-accent":
                          data.specializations.events?.[
                            value as keyof typeof data.specializations.events
                          ],
                      },
                    )}
                  >
                    <div className="text-muted-foreground">{icon}</div>

                    <h4 className="text-foreground">{label}</h4>
                  </Card>
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getPricingRecommendation(data: OnboardingData): PricingTier[] {
  const photographerCount = match(data.studioSize)
    .with("SOLO", () => 1)
    .with("SMALL_STUDIO", () => 5)
    .with("MEDIUM_STUDIO", () => 20)
    .with("LARGE_STUDIO", () => 50)
    .exhaustive();

  const specializations = [
    ...Object.values(data.specializations.portrait || {}),
    ...Object.values(data.specializations.events || {}),
  ].filter(Boolean).length;

  const tiers: PricingTier[] = [
    {
      name: "Starter",
      price: 29,
      description: "Perfect for solo photographers getting started",
      features: [
        "Up to 2 photographers",
        "3 specializations",
        "Basic client management",
        "5GB storage",
        "Email support",
      ],
    },
    {
      name: "Professional",
      price: 79,
      description: "Ideal for growing photography studios",
      features: [
        "Up to 10 photographers",
        "All specializations",
        "Advanced client management",
        "25GB storage",
        "Priority support",
        "Custom branding",
      ],
    },
    {
      name: "Enterprise",
      price: 199,
      description: "For large studios with complex needs",
      features: [
        "Unlimited photographers",
        "All specializations",
        "Advanced client management",
        "100GB storage",
        "24/7 priority support",
        "Custom branding",
        "API access",
        "Dedicated account manager",
      ],
    },
  ];

  let recommendedTierIndex: number;

  if (photographerCount <= 2 && specializations <= 3) {
    recommendedTierIndex = 0; // Starter
  } else if (photographerCount <= 20 && specializations <= 8) {
    recommendedTierIndex = 1; // Professional
  } else {
    recommendedTierIndex = 2; // Enterprise
  }

  const recommendedTier = tiers[recommendedTierIndex];

  if (recommendedTier) {
    recommendedTier.recommended = true;
  }

  return tiers;
}

function getRecommendationReason(
  data: OnboardingData,
  tier: PricingTier,
): string {
  const photographerCount = match(data.studioSize)
    .with("SOLO", () => "1 photographer")
    .with("SMALL_STUDIO", () => "2-5 photographers")
    .with("MEDIUM_STUDIO", () => "5-20 photographers")
    .with("LARGE_STUDIO", () => "20+ photographers")
    .exhaustive();

  const specializations = [
    ...Object.values(data.specializations.portrait || {}),
    ...Object.values(data.specializations.events || {}),
  ].filter(Boolean).length;

  switch (tier.name) {
    case "Starter":
      if (tier.recommended) {
        return `Perfect for your solo/small studio with ${specializations} specialization${
          specializations !== 1 ? "s" : ""
        }. Includes all the essential features you need to get started.`;
      }
      return "Best for solo photographers with basic needs";

    case "Professional":
      if (tier.recommended) {
        return `Ideal for your team of ${photographerCount} and ${specializations} specialization${
          specializations !== 1 ? "s" : ""
        }. Includes advanced features for growing studios.`;
      }
      return "Suitable for growing studios needing more features";

    case "Enterprise":
      if (tier.recommended) {
        return `Optimized for your large studio with ${photographerCount} and ${specializations} specialization${
          specializations !== 1 ? "s" : ""
        }. Includes unlimited resources and premium support.`;
      }
      return "For large studios with complex requirements";

    default:
      return "";
  }
}

function ReviewStep({
  data,
  onSubmit,
}: {
  data: OnboardingData;
  onSubmit: (selectedPlan: string) => Promise<void>;
}) {
  const pricingTiers = getPricingRecommendation(data);
  const [selectedPlan, setSelectedPlan] = useState<string>(
    pricingTiers.find((tier) => tier.recommended)?.name || "",
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Studio Size</h3>
          <p className="text-muted-foreground">
            {match(data.studioSize)
              .with("SOLO", () => "1 photographer")
              .with("SMALL_STUDIO", () => "2-5 photographers")
              .with("MEDIUM_STUDIO", () => "5-20 photographers")
              .with("LARGE_STUDIO", () => "20+ photographers")
              .exhaustive()}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Specializations</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(data.specializations).map(([category, specs]) => (
              <div key={category}>
                <h4 className="font-medium capitalize">{category}</h4>
                <ul className="list-inside list-disc">
                  {Object.entries(specs || {}).map(
                    ([key, value]) =>
                      value && (
                        <li key={key} className="capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </li>
                      ),
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">Recommended Plans</h3>
          <p className="mb-6 text-muted-foreground">
            Based on your studio size and specializations, we recommend the
            following plans:
          </p>
          <div className="grid grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  "relative overflow-hidden hover:border-primary hover:bg-accent/50",
                  {
                    "border-primary": tier.recommended,
                  },
                )}
              >
                {tier.recommended && (
                  <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                    Recommended
                  </div>
                )}
                <div className="p-6">
                  <h4 className="text-xl font-semibold">{tier.name}</h4>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {tier.description}
                  </p>

                  <div
                    className={cn(
                      "mt-4 rounded-md p-3 text-sm",
                      tier.recommended
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {getRecommendationReason(data, tier)}
                  </div>

                  <ul className="mt-6 space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Button
                      className="w-full hover:bg-primary hover:text-primary-foreground"
                      variant={
                        selectedPlan === tier.name ? "default" : "secondary"
                      }
                      onClick={() => {
                        setSelectedPlan(tier.name);
                        onSubmit(tier.name);
                      }}
                    >
                      {selectedPlan === tier.name ? "Selected" : "Select Plan"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingForm() {
  const [data, setData] = useState<OnboardingData>({
    studioSize: "SOLO",
    specializations: {},
    selectedPlan: "",
  });

  const handleSizeSelection = (size: StudioSize) => {
    setData((prev) => ({ ...prev, studioSize: size }));
  };

  const handleSpecializationChange = (
    category: "portrait" | "events",
    subCategory: string,
    checked: boolean,
  ) => {
    setData((prev) => ({
      ...prev,
      specializations: {
        ...prev.specializations,
        [category]: {
          ...prev.specializations[category],
          [subCategory]: checked,
        },
      },
    }));
  };

  const handleSubmit = async (selectedPlan: string) => {
    const result = await saveOnboardingData({
      ...data,
      selectedPlan,
    });
    if (result.success) {
      // Redirect to dashboard or show success message
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Scoped>
        <StepperContent
          data={data}
          onSizeUpdate={handleSizeSelection}
          onSpecializationUpdate={handleSpecializationChange}
          onSubmit={handleSubmit}
        />
      </Scoped>
    </div>
  );
}

function StepperContent({
  data,
  onSizeUpdate,
  onSpecializationUpdate,
  onSubmit,
}: {
  data: OnboardingData;
  onSizeUpdate: (size: StudioSize) => void;
  onSpecializationUpdate: (
    category: "portrait" | "events",
    subCategory: string,
    checked: boolean,
  ) => void;
  onSubmit: (selectedPlan: string) => Promise<void>;
}) {
  const stepper = useStepper();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold">{stepper.current.title}</h2>
        <p className="text-muted-foreground">{stepper.current.description}</p>
      </div>

      {stepper.switch({
        [ONBOARDING_STEPS.STUDIO_SIZE]: () => (
          <StudioSizeStep data={data} onUpdate={onSizeUpdate} />
        ),
        [ONBOARDING_STEPS.SPECIALIZATIONS]: () => (
          <SpecializationsStep data={data} onUpdate={onSpecializationUpdate} />
        ),
        [ONBOARDING_STEPS.REVIEW]: () => (
          <ReviewStep data={data} onSubmit={onSubmit} />
        ),
      })}

      <div className="mt-8 flex justify-between">
        {!stepper.isFirst && (
          <Button variant="outline" onClick={stepper.prev}>
            Back
          </Button>
        )}
        {!stepper.isLast && (
          <div className="ml-auto">
            <Button onClick={stepper.next}>Next</Button>
          </div>
        )}
      </div>
    </div>
  );
}
