import { eq } from "drizzle-orm";
import invariant from "invariant";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { TEAM_COOKIE_NAME } from "~/app/globals";
import { auth } from "~/auth";
import { AppSidebar } from "~/components/app-sidebar";
import {
  SIDEBAR_COOKIE_NAME,
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
  // Get all teams that the current user is a member of
  const user = await db.query.Users.findFirst({
    where: eq(schema.Users.id, session.user.id),
    with: {
      teams: {
        with: {
          team: true,
        },
      },
    },
  });
  const personalTeam = user?.teams.find((team) => team.role === "owner")?.team;
  const userTeams = user?.teams.map((team) => team.team) ?? [];
  const activeTeam = userTeams.find(
    (team) => team.id === cookieStore.get(TEAM_COOKIE_NAME)?.value,
  );

  invariant(personalTeam, "Personal team not found");

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar teams={userTeams} activeTeam={activeTeam ?? personalTeam} />

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
