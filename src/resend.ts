import { Resend } from "resend";
import { env } from "~/env";

export const resend = new Resend(env.RESEND_KEY);

export const resendFrom = "Fast Foto <noreply@casperengelmann.com>";
