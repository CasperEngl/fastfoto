import { InferSelectModel } from "drizzle-orm";
import { User } from "next-auth";
import * as schema from "~/db/schema";

export function isAdmin(
  user?: User,
): user is User & { userType: "admin"; teamId: string } {
  return user?.userType === "admin";
}

export function isClient(
  user?: User,
): user is User & { userType: "client"; teamId?: never } {
  if (isAdmin(user)) {
    return true;
  }

  return user?.userType === "client";
}

export function isPhotographer(
  user?: User,
): user is User & { userType: "photographer"; teamId: string } {
  if (isAdmin(user)) {
    return true;
  }

  return user?.userType === "photographer";
}

export function isTeamManager(
  user: User,
  team: InferSelectModel<typeof schema.Teams> & {
    members: Array<InferSelectModel<typeof schema.Users> & { role: string }>;
  },
): user is User {
  if (isAdmin(user)) {
    return true;
  }

  return team.members.some((member) => {
    const userMatch = user.id === member.id;
    const isOwner = member.role === "owner";
    const isAdmin = member.role === "admin";

    return userMatch && (isOwner || isAdmin);
  });
}
