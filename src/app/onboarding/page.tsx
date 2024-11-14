import OnboardingForm from "~/app/onboarding/onboarding-form";

export default function OnboardingPage() {
  return (
    <main>
      <div className="container max-w-4xl px-4 py-16">
        <div className="mb-8 px-8">
          <h1 className="mb-3 text-balance text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            Tell us about your studio
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Let's get your studio set up so you can start managing your business
            more effectively.
          </p>
        </div>

        <OnboardingForm />
      </div>
    </main>
  );
}
