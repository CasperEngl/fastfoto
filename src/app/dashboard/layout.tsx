import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { DefaultStudioCookie } from "~/app/dashboard/default-studio-cookie";
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
      studioMembers: {
        with: {
          studio: true,
        },
      },
    },
  });
  const personalStudio = user?.studioMembers.find(
    (studioMember) => studioMember.role === "owner",
  )?.studio;
  const userStudios =
    user?.studioMembers.map((studioMembers) => studioMembers.studio) ?? [];
  const activeStudio = userStudios.find(
    (studio) => studio.id === cookieStore.get(STUDIO_COOKIE_NAME)?.value,
  );

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <DefaultStudioCookie studios={userStudios} activeStudio={activeStudio} />

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
