import { redirect } from "next/navigation";
import { SettingsForm } from "~/app/u/settings/settings-form";
import { auth } from "~/auth";
import { Separator } from "~/components/ui/separator";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container max-w-2xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>
      <Separator />
      <SettingsForm user={session.user} />
    </div>
  );
}
