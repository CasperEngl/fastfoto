"use server";

import { eq } from "drizzle-orm";
import { utapi } from "~/app/api/uploadthing/core";
import { db } from "~/db/client";
import { Photos } from "~/db/schema";

export async function deletePhoto(key: string) {
  await Promise.all([
    utapi.deleteFiles(key),
    db.delete(Photos).where(eq(Photos.key, key)),
  ]);
}
