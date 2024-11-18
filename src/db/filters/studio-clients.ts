import { and, eq } from "drizzle-orm";
import { StudioClients } from "~/db/schema";

export const studioFilter = (studioId: string) =>
  eq(StudioClients.studioId, studioId);

export const userFilter = (userId: string) => eq(StudioClients.userId, userId);

export const isStudioClient = (studioId: string, userId: string) =>
  and(studioFilter(studioId), userFilter(userId));
