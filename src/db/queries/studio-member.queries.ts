import { and, eq, or } from "drizzle-orm";
import { StudioMembers } from "~/db/schema";

export const hasStudioRole = (role: "owner" | "admin" | "member") =>
  eq(StudioMembers.role, role);

export const hasAdminPermission = and(
  or(hasStudioRole("owner"), hasStudioRole("admin")),
);

export const isStudioMember = (studioId: string, userId: string) =>
  and(eq(StudioMembers.studioId, studioId), eq(StudioMembers.userId, userId));

export const isStudioManager = (studioId: string, userId: string) =>
  and(isStudioMember(studioId, userId), hasAdminPermission);

export const isStudioOwner = (studioId: string, userId: string) =>
  and(isStudioMember(studioId, userId), hasStudioRole("owner"));
