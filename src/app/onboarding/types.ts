export type StudioSize =
  | "SOLO" // 1 photographer
  | "SMALL_STUDIO" // 2-5 photographers
  | "MEDIUM_STUDIO" // 5-20 photographers
  | "LARGE_STUDIO"; // 20+ photographers

export type Specialization = {
  portrait?: {
    family?: boolean;
    corporateHeadshots?: boolean;
    pets?: boolean;
    maternity?: boolean;
    newborn?: boolean;
  };
  events?: {
    wedding?: boolean;
    graduation?: boolean;
    professionalSporting?: boolean;
    dancePerformance?: boolean;
    businessEvents?: boolean;
  };
};

export interface OnboardingData {
  studioSize: StudioSize;
  specializations: Specialization;
  selectedPlan: string;
}

export const ONBOARDING_STEPS = {
  STUDIO_SIZE: "studio_size",
  SPECIALIZATIONS: "specializations",
  REVIEW: "review",
} as const;

export type OnboardingStep =
  (typeof ONBOARDING_STEPS)[keyof typeof ONBOARDING_STEPS];
