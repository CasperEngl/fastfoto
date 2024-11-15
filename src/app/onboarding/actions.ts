"use server";

import { PricingTier } from "~/app/onboarding/types";

export async function selectPlan(plan: PricingTier) {
  console.log(`Attempting to select plan: ${plan.name}`);

  try {
    console.log(`Successfully selected plan: ${plan.name}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to select plan: ${plan.name}`, error);
    return { success: false, error: `Failed to select plan: ${plan.name}` };
  }
}
