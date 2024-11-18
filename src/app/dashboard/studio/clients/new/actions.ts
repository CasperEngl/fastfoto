"use server";

import dayjs from "dayjs";
import { inArray } from "drizzle-orm";
import { StudioClientInvitationEmail } from "emails/studio-client-invitation-email";
import invariant from "invariant";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { STUDIO_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { db } from "~/db/client";
import * as studioMembersFilters from "~/db/filters/studio-members";
import * as schema from "~/db/schema";
import { env } from "~/env";
import { resend, resendFrom } from "~/resend";

export async function createClient(data: { emails: string[] }) {
  const session = await auth();
  const cookieStore = await cookies();
  const selectedStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;

  return await db.transaction(async (tx) => {
    invariant(session?.user?.id, "Unauthorized");
    invariant(selectedStudioId, "Must select a studio");

    const studioMember = await tx.query.StudioMembers.findFirst({
      where: studioMembersFilters.isStudioMember(
        selectedStudioId,
        session.user.id,
      ),
      columns: {
        id: true,
      },
      with: {
        studio: true,
        user: true,
      },
    });

    if (!studioMember) {
      throw new Error("Unauthorized");
    }

    // Find existing users
    const existingUsers = await tx.query.Users.findMany({
      where: inArray(schema.Users.email, data.emails),
    });

    const existingEmails = new Set(existingUsers.map((user) => user.email));

    // Create StudioClients for existing users
    if (existingUsers.length > 0) {
      await tx
        .insert(schema.StudioClients)
        .values(
          existingUsers.map((user) => ({
            studioId: selectedStudioId,
            userId: user.id,
          })),
        )
        .onConflictDoNothing();
    }

    // Create invitations only for new users
    const newUserEmails = data.emails.filter(
      (email) => !existingEmails.has(email),
    );

    if (newUserEmails.length > 0) {
      const expiresAt = dayjs().add(1, "day");

      const invitations = await tx
        .insert(schema.UserInvitations)
        .values(
          newUserEmails.map((email) => {
            invariant(session?.user?.id, "Unauthorized");

            return {
              email,
              expiresAt: expiresAt.toDate(),
              invitedById: session.user.id,
              studioId: selectedStudioId,
              type: "studio_client" as const,
            };
          }),
        )
        .returning();

      // Send invitation emails only to new users
      await Promise.all(
        invitations.map(async (invitation) => {
          const inviteUrl = `${env.APP_URL}/auth/register?invitation=${invitation.id}`;

          await resend.emails.send({
            from: resendFrom,
            to: invitation.email,
            subject: `Join ${studioMember.studio.name} on Fast Foto`,
            react: StudioClientInvitationEmail({
              studioName: studioMember.studio.name,
              inviterName: studioMember.user.name || "Your photographer",
              inviteUrl,
              collectionName: undefined,
            }),
          });
        }),
      );
    }

    revalidatePath("/dashboard/studio/clients");
  });
}
