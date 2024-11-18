import { z } from "zod";

export const RegisterFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  invitationId: z.string().optional(),
});
