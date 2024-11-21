import type { CollectionConfig } from "payload";

export const Studios = {
  slug: "studios",
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
      name: "logo",
      type: "text",
    },
    {
      name: "createdById",
      type: "relationship",
      relationTo: "users",
      required: true,
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
