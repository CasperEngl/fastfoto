import type { Metadata } from "next";
import localFont from "next/font/local";
import NextTopLoader from "nextjs-toploader";
import { auth } from "~/auth";
import { cn } from "~/lib/utils";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
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

  return (
    <html lang="en">
      <body
        className={cn(
          "flex min-h-screen flex-col scroll-smooth bg-white antialiased",
          geistSans.variable,
        )}
      >
        <NextTopLoader color="#047857" />

        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
