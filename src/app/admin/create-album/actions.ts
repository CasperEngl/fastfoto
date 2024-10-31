"use server";

import { revalidatePath } from "next/cache";
import { InferInsertModel } from "drizzle-orm";
import { Albums } from "~/db/schema";
import { db } from "~/db/client";

export async function createAlbum(data: InferInsertModel<typeof Albums>) {
  try {
    const album = await db.insert(Albums).values(data);

    revalidatePath("/admin/albums");

    return album;
  } catch (error) {
    console.error("Error creating album:", error);
    throw new Error("Failed to create album");
  }
}
