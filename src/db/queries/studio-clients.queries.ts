import { and, eq } from "drizzle-orm";
import { StudioClients } from "~/db/schema";

export const isStudioClient = (studioId: string, clientId: string) =>
  and(eq(StudioClients.userId, clientId), eq(StudioClients.studioId, studioId));

export const studioClients = (studioId: string) =>
  eq(StudioClients.studioId, studioId);
