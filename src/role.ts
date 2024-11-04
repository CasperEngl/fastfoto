import { User } from "next-auth";

export function isAdmin(user?: User): user is User & { userType: "admin" } {
  return user?.userType === "admin";
}

export function isClient(user?: User): user is User & { userType: "client" } {
  if (isAdmin(user)) {
    return true;
  }

  return user?.userType === "client";
}

export function isPhotographer(
  user?: User,
): user is User & { userType: "photographer" } {
  if (isAdmin(user)) {
    return true;
  }

  return user?.userType === "photographer";
}
