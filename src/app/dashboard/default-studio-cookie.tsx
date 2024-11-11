"use client";

import { InferSelectModel } from "drizzle-orm";
import { useEffect } from "react";
import { changeStudio } from "~/actions";
import type * as schema from "~/db/schema";

export function DefaultStudioCookie({
  studios,
  activeStudio,
}: {
  studios: Array<InferSelectModel<typeof schema.Studios>>;
  activeStudio?: InferSelectModel<typeof schema.Studios>;
}) {
  useEffect(() => {
    const firstStudioId = studios[0]?.id;

    if (!activeStudio && firstStudioId) {
      changeStudio(firstStudioId);
    }
  }, [studios, activeStudio]);

  return null;
}
