import invariant from "invariant";
import { notFound } from "next/navigation";
import { StudioSettingsProvider } from "~/app/dashboard/studio/settings/studio-settings-context";
import { StudiosManager } from "~/app/dashboard/studio/settings/studios-manager";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as studioMembersQuery from "~/db/queries/studio-members.query";
import { hasStudioManagerRole, isPhotographer } from "~/role";
import { eq } from "drizzle-orm";
import { UserInvitations } from "~/db/schema";

export default async function StudioSettingsPage() {
  const session = await auth();

  if (!isPhotographer(session?.user)) {
    return notFound();
  }

  invariant(session?.user?.id, "User is required");

  const userStudios = await db.query.StudioMembers.findMany({
    where: studioMembersQuery.userFilter(session.user.id),
    with: {
      studio: {
        with: {
          studioMembers: {
            with: {
              user: true,
            },
          },
          userInvitations: {
            where: eq(UserInvitations.status, "pending"),
          },
        },
      },
    },
  });

  const studios = userStudios
    .map((studio) => ({
      ...studio.studio,
      users: studio.studio.studioMembers.map((member) => ({
        ...member.user,
        role: member.role,
      })),
      pendingInvitations: studio.studio.userInvitations,
      userRole: studio.role,
    }))
    .sort((a, b) => {
      if (a.userRole === "owner" && b.userRole !== "owner") return -1;
      if (b.userRole === "owner" && a.userRole !== "owner") return 1;
      return a.name.localeCompare(b.name);
    });

  const userManagableStudios = studios
    .filter((studio) => {
      invariant(session.user, "User is required");
      return hasStudioManagerRole(session.user, studio);
    })
    .map((studio) => studio.id);

  return (
    <div className="container space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Studios</h1>
        <p className="text-sm text-muted-foreground">
          Manage your studio memberships and permissions.
        </p>
      </div>
      <StudioSettingsProvider userManagableStudios={userManagableStudios}>
        <StudiosManager studios={studios} />
      </StudioSettingsProvider>
    </div>
  );
}
