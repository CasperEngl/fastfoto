import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "~/auth";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}
