import { cookies } from "next/headers";
import { Toaster } from "sonner";
import { AppSidebar } from "~/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "~/components/ui/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />

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
