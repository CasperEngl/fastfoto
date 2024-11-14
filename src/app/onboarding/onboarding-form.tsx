"use client";

import { defineStepper } from "@stepperize/react";
import { AnimatePresence, motion } from "framer-motion";
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
import {
  parseAsJson,
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "nuqs";
import { useEffect, useState } from "react";
import { match } from "ts-pattern";
import { z } from "zod";
import { selectPlan } from "~/app/onboarding/actions";
import {
  ONBOARDING_STEPS,
  studioSizeEnum,
  OnboardingData,
  PricingTier,
  Specialization,
  OnboardingStep,
} from "~/app/onboarding/types";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";

const MotionButton = motion(Button);

const { Scoped, useStepper } = defineStepper(
  {
    id: ONBOARDING_STEPS.STUDIO_SIZE,
    title: "Studio Size",
    description: "How many photographers work in your studio?",
    initialStep:
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("step") ||
          ONBOARDING_STEPS.STUDIO_SIZE
        : ONBOARDING_STEPS.STUDIO_SIZE,
  },
  {
    id: ONBOARDING_STEPS.SPECIALIZATIONS,
    title: "Specializations",
    description: "Select the types of photography your studio offers",
  },
  {
    id: ONBOARDING_STEPS.REVIEW,
    title: "Recommended Plans",
    description:
      "Based on your studio size and specializations, we recommend the following plans:",
  },
);

function StudioSizeStep({
  data,
  onUpdate,
}: {
  data: OnboardingData;
  onUpdate: (size: z.infer<typeof studioSizeEnum>) => void;
}) {
  return (
    <div className="space-y-4">
      <RadioGroup
        defaultValue={data.studioSize}
        onValueChange={(value) =>
          onUpdate(value as z.infer<typeof studioSizeEnum>)
        }
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
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={cn(
                    "flex h-32 flex-col items-center justify-center gap-y-2 p-4 text-center transition-all hover:bg-accent",
                    { "border-primary bg-accent": data.studioSize === value },
                  )}
                >
                  <motion.div
                    className="text-muted-foreground"
                    animate={{ scale: data.studioSize === value ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {icon}
                  </motion.div>
                  <h3 className="text-lg text-foreground">{label}</h3>
                </Card>
              </motion.div>

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
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
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
                  </motion.div>
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
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
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
                  </motion.div>
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
        return `Perfect for your solo/small studio${
          specializations
            ? ` with ${specializations} specialization${
                specializations !== 1 ? "s" : ""
              }`
            : ""
        }. Includes all the essential features you need to get started.`;
      }
      return "Best for solo photographers with basic needs";

    case "Professional":
      if (tier.recommended) {
        return `Ideal for your team of ${photographerCount}${
          specializations
            ? ` and ${specializations} specialization${
                specializations !== 1 ? "s" : ""
              }`
            : ""
        }. Includes advanced features for growing studios.`;
      }
      return "Suitable for growing studios needing more features";

    case "Enterprise":
      if (tier.recommended) {
        return `Optimized for your large studio with ${photographerCount}${
          specializations
            ? ` and ${specializations} specialization${
                specializations !== 1 ? "s" : ""
              }`
            : ""
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
  onSubmit: (selectedPlan: PricingTier) => Promise<void>;
}) {
  const pricingTiers = getPricingRecommendation(data);
  const [selectedPlan, setSelectedPlan] = useState<PricingTier | null>(null);

  return (
    <div className="@container -mx-8 mt-8">
      <div className="@3xl:grid-cols-3 @3xl:max-w-none mx-auto grid max-w-prose grid-cols-1 gap-6">
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
                  "mt-4 text-pretty rounded-md p-3 text-sm",
                  tier.recommended
                    ? "bg-primary text-primary-foreground"
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
                <MotionButton
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="w-full hover:bg-primary hover:text-primary-foreground"
                  variant={
                    selectedPlan?.name === tier.name ? "default" : "secondary"
                  }
                  onClick={() => {
                    setSelectedPlan(tier);
                    onSubmit(tier);
                  }}
                >
                  Select Plan
                </MotionButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function OnboardingForm() {
  const [step, setStep] = useQueryState(
    "step",
    parseAsStringEnum(Object.values(ONBOARDING_STEPS)).withDefault(
      ONBOARDING_STEPS.STUDIO_SIZE,
    ),
  );
  const [studioSize, setStudioSize] = useQueryState(
    "studio_size",
    parseAsStringEnum(studioSizeEnum.options).withDefault("SOLO"),
  );
  const [specializations, setSpecializations] = useQueryState(
    "specializations",
    parseAsJson<Specialization>((value) => {
      console.log("parsing specializations", JSON.stringify(value, null, 2));

      if (typeof value !== "object" || value === null) return {};

      return value;
    }).withDefault({}),
  );
  const [selectedPlan, setSelectedPlan] = useQueryState(
    "selected_plan",
    parseAsString.withDefault(""),
  );

  return (
    <Scoped initialStep={step}>
      <StepperContent
        data={{ studioSize, specializations, selectedPlan }}
        onSizeUpdate={(studioSize) => setStudioSize(studioSize)}
        onSpecializationUpdate={(category, subCategory, checked) =>
          setSpecializations((prev) => ({
            ...prev,
            [category]: {
              ...prev[category],
              [subCategory]: checked,
            },
          }))
        }
        onStepUpdate={(step) => setStep(step)}
        onSubmit={async (selectedPlan) => {
          setSelectedPlan(selectedPlan.name);
          await selectPlan(selectedPlan);
        }}
      />
    </Scoped>
  );
}

function StepperContent({
  data,
  onSizeUpdate,
  onSpecializationUpdate,
  onSubmit,
  onStepUpdate,
}: {
  data: OnboardingData;
  onSizeUpdate: (size: z.infer<typeof studioSizeEnum>) => void;
  onSpecializationUpdate: (
    category: "portrait" | "events",
    subCategory: string,
    checked: boolean,
  ) => void;
  onSubmit: (selectedPlan: PricingTier) => Promise<void>;
  onStepUpdate: (step: OnboardingStep) => void;
}) {
  const stepper = useStepper();

  useEffect(() => {
    onStepUpdate(stepper.current.id);
  }, [stepper.current.id]);

  return (
    <div className="relative px-8">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={stepper.current.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{
            opacity: 1,
            x: 0,
            transition: { duration: 0.5, delay: 0.3 },
          }}
          exit={{ opacity: 0, x: -50, position: "absolute" as const }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold">{stepper.current.title}</h2>
          <p className="text-muted-foreground">{stepper.current.description}</p>

          <div className="mt-8">
            {stepper.switch({
              [ONBOARDING_STEPS.STUDIO_SIZE]: () => (
                <StudioSizeStep data={data} onUpdate={onSizeUpdate} />
              ),
              [ONBOARDING_STEPS.SPECIALIZATIONS]: () => (
                <SpecializationsStep
                  data={data}
                  onUpdate={onSpecializationUpdate}
                />
              ),
              [ONBOARDING_STEPS.REVIEW]: () => (
                <ReviewStep data={data} onSubmit={onSubmit} />
              ),
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="mt-8 flex justify-between"
        layoutId="buttons"
        transition={{ duration: 0.3 }}
      >
        {!stepper.isFirst && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Button variant="outline" onClick={stepper.prev}>
              Back
            </Button>
          </motion.div>
        )}
        {!stepper.isLast && (
          <motion.div
            className="ml-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <Button onClick={stepper.next}>Next</Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
