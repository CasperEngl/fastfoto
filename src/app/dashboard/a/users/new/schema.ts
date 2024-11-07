import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
