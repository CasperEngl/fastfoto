import type { CollectionConfig } from "payload";

export const Albums = {
  slug: "albums",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "studioId",
      type: "relationship",
      relationTo: "studios",
      required: true,
    },
    {
      name: "photos",
      type: "relationship",
      relationTo: "media",
      hasMany: true,
      admin: {
        description: "Photos in this album",
      },
    },
    {
      name: "createdAt",
      type: "date",
      admin: {
        readOnly: true,
      },
    },
    {
      name: "updatedAt",
      type: "date",
      admin: {
        readOnly: true,
      },
    },
  ],
} satisfies CollectionConfig;
