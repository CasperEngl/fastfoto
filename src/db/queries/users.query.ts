import { and, eq } from "drizzle-orm";
import * as schema from "~/db/schema";

export const hasUserRole = (
  role: (typeof schema.userType.enumValues)[number],
) => eq(schema.Users.userType, role);

export const isUser = (userId: string) => eq(schema.Users.id, userId);

export const isUserWithRole = (
  userId: string,
  role: (typeof schema.userType.enumValues)[number],
) => and(isUser(userId), hasUserRole(role));

export const isUserAdmin = (userId: string) => isUserWithRole(userId, "admin");
export const isUserClient = (userId: string) =>
  isUserWithRole(userId, "client");
export const isUserPhotographer = (userId: string) =>
  isUserWithRole(userId, "photographer");

export const isAdmin = hasUserRole("admin");
export const isClient = hasUserRole("client");
export const isPhotographer = hasUserRole("photographer");
