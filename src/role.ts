import { User } from "next-auth";

export function isAdmin(user?: User) {
  return user?.type === "admin";
}

export function isClient(user?: User) {
  return user?.type === "client";
}

export function isPhotographer(user?: User) {
  return user?.type === "photographer";
}
