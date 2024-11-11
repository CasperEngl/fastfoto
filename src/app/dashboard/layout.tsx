import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { SIDEBAR_COOKIE_NAME, STUDIO_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { AppSidebar } from "~/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { db } from "~/db/client";
import * as schema from "~/db/schema";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value === "true";
  // Get all studios that the current user is a member of
  const user = await db.query.Users.findFirst({
    where: eq(schema.Users.id, session.user.id),
    with: {
      studios: {
        with: {
          studio: true,
        },
      },
    },
  });
  const personalStudio = user?.studios.find(
    (studio) => studio.role === "owner",
  )?.studio;
  const userStudios = user?.studios.map((studio) => studio.studio) ?? [];
  const activeStudio = userStudios.find(
    (studio) => studio.id === cookieStore.get(STUDIO_COOKIE_NAME)?.value,
  );

  if (user?.userType === "photographer") {
    try {
      const cookieStore = await cookies();
      const selectedStudioId = cookieStore.get(STUDIO_COOKIE_NAME)?.value;

      if (selectedStudioId) {
        return session;
      }

      const userStudios = await db.query.StudioMembers.findMany({
        where: eq(schema.StudioMembers.userId, user.id),
        with: {
          studio: true,
        },
      });

      const userPersonalStudio = userStudios?.find(
        (studio) => studio.role === "owner",
      );

      if (!userPersonalStudio) {
        return session;
      }

      cookieStore.set(STUDIO_COOKIE_NAME, userPersonalStudio?.studioId);
    } catch (error) {
      throw error;
    }
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar
        studios={userStudios}
        activeStudio={activeStudio ?? personalStudio}
      />

      <SidebarInset className="w-full">
        <header className="border-b">
          <div className="container flex items-center gap-4 p-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Fast Foto</h1>
          </div>
        </header>

        <main className="container px-4">{children}</main>
      </SidebarInset>

      <Toaster />
    </SidebarProvider>
  );
}
