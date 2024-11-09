import { eq } from "drizzle-orm";
import { CheckCircle2, XCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { PasskeyButton } from "~/app/dashboard/u/settings/passkey-button";
import { SettingsForm } from "~/app/dashboard/u/settings/settings-form";
import { TeamsManager } from "~/app/dashboard/u/settings/teams-manager";
import { auth } from "~/auth";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import { db } from "~/db/client";
import * as schema from "~/db/schema";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; error?: string }>;
}) {
  const { error, verified } = await searchParams;
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const userTeams = await db.query.UsersToTeams.findMany({
    where: eq(schema.UsersToTeams.userId, session.user.id),
    with: {
      team: {
        with: {
          members: {
            with: {
              user: true,
            },
          },
        },
      },
    },
  });
  const teams = userTeams.map((team) => ({
    ...team.team,
    members: team.team.members.map((member) => member.user),
  }));

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
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Teams</h2>
        <p className="text-sm text-muted-foreground">
          Manage your team memberships and permissions.
        </p>
      </div>
      <TeamsManager teams={teams} />
    </div>
  );
}
