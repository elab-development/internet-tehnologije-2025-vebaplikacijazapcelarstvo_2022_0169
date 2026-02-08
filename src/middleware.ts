import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

 
  const protectedRoutes = ["/pcelinjaci", "/aktivnosti", "/dnevnik", "/profil"];

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pcelinjaci/:path*", "/aktivnosti/:path*", "/dnevnik/:path*", "/profil/:path*"],
};
