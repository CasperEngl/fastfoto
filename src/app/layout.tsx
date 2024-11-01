import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "~/components/ui/sonner";
import { auth } from "~/auth";
import { AppSidebar } from "~/components/app-sidebar";
import { cookies } from "next/headers";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Fast Foto",
  description:
    "Fast Foto - A lightning-fast photo sharing and viewing experience",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />

          <Providers session={session}>
            <SidebarInset className="w-full">
              <header className="border-b">
                <div className="container flex items-center gap-4 p-4">
                  <SidebarTrigger />
                  <h1 className="text-xl font-semibold">Fast Foto</h1>
                </div>
              </header>

              <main className="container px-4">{children}</main>
            </SidebarInset>
          </Providers>

          <Toaster />
        </SidebarProvider>
      </body>
    </html>
  );
}
