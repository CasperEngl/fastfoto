import { User } from "next-auth";

export function isAdmin(user?: User): user is User & { type: "admin" } {
  return user?.type === "admin";
}

export function isClient(user?: User): user is User & { type: "client" } {
  if (isAdmin(user)) {
    return true;
  }

  return user?.type === "client";
}

export function isPhotographer(
  user?: User,
): user is User & { type: "photographer" } {
  if (isAdmin(user)) {
    return true;
  }

  return user?.type === "photographer";
}
