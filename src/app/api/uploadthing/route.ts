import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "~/app/api/uploadthing/core";
import { env } from "~/env";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
