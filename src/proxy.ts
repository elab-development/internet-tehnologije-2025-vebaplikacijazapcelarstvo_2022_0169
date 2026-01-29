import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import type { UserRole } from "@/lib/types";

const JWT_SECRET = process.env.JWT_SECRET!;

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

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 0) Nikad ne diraj Next interne fajlove / statiku / slike / favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/robots.txt") ||
    pathname.startsWith("/sitemap.xml") ||
    pathname.match(/\.(css|js|map|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // 1) Nikad ne diraj API rute (login/register moraju da rade bez auth)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 2) Javne stranice
  if (pathname === "/" || pathname.startsWith("/prijava") || pathname.startsWith("/registracija")) {
    return NextResponse.next();
  }

  // 3) Štitimo SAMO privatne rute (ostalo pusti)
  const isProtected =
    pathname.startsWith("/pcelinjak") ||
    pathname.startsWith("/aktivnosti") ||
    pathname.startsWith("/dnevnik") ||
    pathname.startsWith("/profil") ||
    pathname.startsWith("/admin");

  if (!isProtected) {
    return NextResponse.next();
  }

  // 4) Provera auth cookie
  const token = req.cookies.get("auth")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = getRoleFromToken(token);
  if (!role) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 5) Admin-only
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}
