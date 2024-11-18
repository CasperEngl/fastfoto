import { and, eq, or } from "drizzle-orm";
import * as schema from "~/db/schema";

export const studioFilter = (studioId: string) =>
  eq(schema.StudioMembers.studioId, studioId);

export const userFilter = (userId: string) =>
  eq(schema.StudioMembers.userId, userId);

export const hasStudioRole = (role: "owner" | "admin" | "member") =>
  eq(schema.StudioMembers.role, role);

export const hasAdminPermission = and(
  or(hasStudioRole("owner"), hasStudioRole("admin")),
);

export const isStudioMember = (studioId: string, userId: string) =>
  and(studioFilter(studioId), userFilter(userId));

export const isStudioManager = (studioId: string, userId: string) =>
  and(isStudioMember(studioId, userId), hasAdminPermission);

export const isStudioOwner = (studioId: string, userId: string) =>
  and(isStudioMember(studioId, userId), hasStudioRole("owner"));
