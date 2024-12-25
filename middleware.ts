import type { Session } from "@/utils/auth";
import { NextResponse, type NextRequest } from "next/server";

export default async function authMiddleware(request: NextRequest) {
  const session = (await fetch(
    `${request.nextUrl.origin}/api/auth/get-session`,
    {
      headers: {
        //get the cookie from the request
        cookie: request.headers.get("cookie") ?? "",
      },
    }
  ).then((r) => r.json())) as Session;

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/quiz/:path*", "/result:path*", "/user:path*"],
};
