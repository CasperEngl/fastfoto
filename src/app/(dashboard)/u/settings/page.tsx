import { redirect } from "next/navigation";
import { PasskeyForm } from "./passkey";
import { Separator } from "@radix-ui/react-separator";
import { SettingsForm } from "~/app/(dashboard)/u/settings/settings-form";
import { auth } from "~/auth";

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
