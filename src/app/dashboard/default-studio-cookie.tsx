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
    if (!activeStudio) {
      changeStudio(studios[0].id);
    }
  }, []);

  return null;
}
