import OnboardingForm from "./onboarding-form";

export default function OnboardingPage() {
  return (
    <main>
      <div className="container mx-auto max-w-4xl py-8">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Tell us about your studio
        </h1>
        <OnboardingForm />
      </div>
    </main>
  );
}
