"use server";

import { OnboardingData } from "./types";

export async function saveOnboardingData(data: OnboardingData) {
  console.log("Saving onboarding data:", data);
  try {
    // TODO: Save the onboarding data to your database
    // This is where you would store the studio preferences

    return { success: true };
  } catch (error) {
    console.error("Failed to save onboarding data:", error);
    return { success: false, error: "Failed to save studio preferences" };
  }
}
