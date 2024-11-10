import { eq } from "drizzle-orm";
import invariant from "invariant";
import { redirect } from "next/navigation";
import { StudiosManager } from "~/app/dashboard/t/settings/studios-manager";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as schema from "~/db/schema";
import { hasStudioManagerRole } from "~/role";

export default async function StudioSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const userStudios = await db.query.StudioMembers.findMany({
    where: eq(schema.StudioMembers.userId, session.user.id),
    with: {
      studio: {
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
  const studios = userStudios.map((studio) => ({
    ...studio.studio,
    members: studio.studio.members.map((member) => ({
      ...member.user,
      role: member.role,
    })),
  }));
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
      <StudiosManager
        studios={studios}
        userManagableStudios={userManagableStudios}
      />
    </div>
  );
}
