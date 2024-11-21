import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { RegisterForm } from "~/app/(my-app)/auth/register/register-form";
import { auth } from "~/auth";
import { db } from "~/db/client";
import { UserInvitations } from "~/db/schema";

const searchParamsSchema = z.object({
  invitation: z.string().optional(),
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<unknown>;
}) {
  const session = await auth();

  if (session) {
    return redirect("/");
  }

  const validated = searchParamsSchema.safeParse(await searchParams);

  if (!validated.success) {
    return redirect("/");
  }

  const invitation = validated.data.invitation
    ? await db.query.UserInvitations.findFirst({
        where: eq(UserInvitations.id, validated.data.invitation),
      })
    : null;

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <RegisterForm invitation={invitation} />
    </div>
  );
}
