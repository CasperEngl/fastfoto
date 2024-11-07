import { CheckCircle2, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { PasskeyButton } from "~/app/dashboard/u/settings/passkey-button";
import { SettingsForm } from "~/app/dashboard/u/settings/settings-form";
import { auth } from "~/auth";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; error?: string }>;
}) {
  const { error, verified } = await searchParams;
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  return (
    <div className="container space-y-6 py-8">
      {verified ? (
        <Alert variant="success">
          <CheckCircle2 className="size-4" />
          <AlertTitle>Email successfully verified!</AlertTitle>
          <AlertDescription>Your email has been updated.</AlertDescription>
        </Alert>
      ) : null}

      {error === "invalid-token" ? (
        <Alert variant="destructive">
          <XCircle className="size-4" />
          <AlertTitle>Invalid verification link</AlertTitle>
          <AlertDescription>
            Please try requesting a new email verification.
          </AlertDescription>
        </Alert>
      ) : null}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <SettingsForm user={session.user} />
      <Separator />
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Passkeys</h2>
        <p className="text-sm text-muted-foreground">
          Manage your passkeys for secure authentication.
        </p>
      </div>
      <PasskeyButton />
    </div>
  );
}
