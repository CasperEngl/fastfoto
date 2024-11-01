"use server";

import { InferInsertModel } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/db/client";
import { Albums } from "~/db/schema";

export async function createAlbum(data: InferInsertModel<typeof Albums>) {
  const [album] = await db
    .insert(Albums)
    .values({
      name: data.name,
      description: data.description,
    })
    .returning();

  revalidatePath("/p/albums");
  return album;
}
