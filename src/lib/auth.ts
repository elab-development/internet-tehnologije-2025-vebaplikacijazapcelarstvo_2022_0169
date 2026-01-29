import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { AuthTokenClaims, AuthUser, UserRole } from "@/lib/types";

export const AUTH_COOKIE = "auth";
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in env file");
}

/** Potpisivanje tokena (7 dana) */
export function signAuthToken(claims: AuthTokenClaims) {
  return jwt.sign(claims, JWT_SECRET, { algorithm: "HS256", expiresIn: "7d" });
}

/** Verifikacija tokena + validacija obaveznih polja */
export function verifyAuthToken(token: string): AuthTokenClaims {
  const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & Partial<AuthTokenClaims>;

  if (!payload || !payload.sub || !payload.email || !payload.role) {
    throw new Error("Invalid token");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name ?? "",
    role: payload.role as UserRole,
  };
}

/** Standardne cookie opcije */
export function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dana
  };
}

/** Vrati ulogu iz cookie-a (server-side) */
export async function getRoleFromCookies(): Promise<UserRole | null> {
  const cookieStore = await cookies(); // u novijem Next-u može biti Promise
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const claims = verifyAuthToken(token);
    return claims.role;
  } catch {
    return null;
  }
}

/** Vrati AuthUser iz cookie-a (server-side) */
export async function getAuthUserFromCookies(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const claims = verifyAuthToken(token);
    return {
      id: claims.sub,
      email: claims.email,
      name: claims.name,
      role: claims.role,
    };
  } catch {
    return null;
  }
}

