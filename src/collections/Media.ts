import type { CollectionConfig } from "payload";

export const Media = {
  slug: "media",
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: "alt",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "text",
    },
    {
      name: "albumId",
      type: "relationship",
      relationTo: "albums",
    },
    {
      name: "order",
      type: "number",
    },
    {
      name: "uploadedAt",
      type: "date",
      admin: {
        readOnly: true,
      },
    },
  ],
  upload: {
    staticDir: "media",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 1024,
        position: "centre",
      },
      {
        name: "full",
        width: 1920,
        height: 1080,
        position: "centre",
      },
    ],
    mimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
  },
} satisfies CollectionConfig;
