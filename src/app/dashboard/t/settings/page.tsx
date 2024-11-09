import { eq } from "drizzle-orm";
import invariant from "invariant";
import { redirect } from "next/navigation";
import { TeamsManager } from "~/app/dashboard/t/settings/teams-manager";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as schema from "~/db/schema";
import { isTeamManager } from "~/role";

export default async function TeamSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const userTeams = await db.query.TeamMembers.findMany({
    where: eq(schema.TeamMembers.userId, session.user.id),
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
    members: team.team.members.map((member) => ({
      ...member.user,
      role: member.role,
    })),
  }));
  const userManagableTeams = teams
    .filter((team) => {
      invariant(session.user, "User is required");

      return isTeamManager(session.user, team);
    })
    .map((team) => team.id);

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Teams</h1>
        <p className="text-sm text-muted-foreground">
          Manage your team memberships and permissions.
        </p>
      </div>
      <TeamsManager teams={teams} userManagableTeams={userManagableTeams} />
    </div>
  );
}
