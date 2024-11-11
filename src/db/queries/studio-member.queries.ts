import { and, eq, or } from "drizzle-orm";
import { StudioMembers } from "~/db/schema";

export const userStudios = (userId: string) => eq(StudioMembers.userId, userId);

export const studioMembers = (studioId: string) =>
  eq(StudioMembers.studioId, studioId);

export const hasStudioRole = (role: "owner" | "admin" | "member") =>
  eq(StudioMembers.role, role);

export const hasAdminPermission = and(
  or(hasStudioRole("owner"), hasStudioRole("admin")),
);

export const isStudioMember = (studioId: string, userId: string) =>
  and(studioMembers(studioId), userStudios(userId));

export const isStudioManager = (studioId: string, userId: string) =>
  and(isStudioMember(studioId, userId), hasAdminPermission);

export const isStudioOwner = (studioId: string, userId: string) =>
  and(isStudioMember(studioId, userId), hasStudioRole("owner"));
