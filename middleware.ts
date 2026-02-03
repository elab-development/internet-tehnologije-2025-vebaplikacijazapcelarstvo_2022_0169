import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import type { UserRole } from "@/shared/types";

const JWT_SECRET = process.env.JWT_SECRET!;
const AUTH_COOKIE = "auth";

function getRoleFromToken(token: string): UserRole | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const role = payload?.role;
    if (role === "ADMIN" || role === "PCELAR" || role === "POLJOPRIVREDNIK") return role;
    return null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.match(/\.(css|js|map|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const role = token ? getRoleFromToken(token) : null;


  if (pathname.startsWith("/api")) {
    
    if (pathname === "/api/auth/login" || pathname === "/api/auth/register") {
      return NextResponse.next();
    }

    
    if (!token || !role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    if (pathname.startsWith("/api/admin") && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  }

  
  if (pathname === "/" || pathname.startsWith("/prijava") || pathname.startsWith("/registracija")) {
    return NextResponse.next();
  }

  
  const isProtected =
    pathname.startsWith("/pcelinjaci") ||
    pathname.startsWith("/aktivnosti") ||
    pathname.startsWith("/dnevnik") ||
    pathname.startsWith("/profil") ||
    pathname.startsWith("/admin");

  if (!isProtected) return NextResponse.next();

  
  if (!token || !role) {
    return NextResponse.redirect(new URL("/", req.url)); 
  }


  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
