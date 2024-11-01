import { redirect } from "next/navigation";
import { SettingsForm } from "~/app/u/settings/settings-form";
import { auth } from "~/auth";
import { Separator } from "~/components/ui/separator";
import { PasskeyForm } from "./passkey";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator />
      <SettingsForm user={session.user} />
      <Separator />
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Passkeys</h2>
        <p className="text-sm text-muted-foreground">
          Manage your passkeys for secure authentication.
        </p>
      </div>
      <PasskeyForm />
    </div>
  );
}
