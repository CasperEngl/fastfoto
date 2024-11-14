import { eq } from "drizzle-orm";
import * as schema from "~/db/schema";

export const isAlbum = (albumId: string) => eq(schema.Albums.id, albumId);
