import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { AuthTokenClaims, AuthUser, UserRole } from "@/shared/types";

export const AUTH_COOKIE = "auth";
const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in env file");
}

/** Normalizacija uloge: sve svodimo na format koji koristi aplikacija */
function normalizeRole(role: any): UserRole {
  const raw = String(role ?? "").trim();
  const upper = raw.toUpperCase();

  // admin može doći kao "administrator" / "ADMINISTRATOR" -> mapiramo na "ADMIN"
  if (upper === "ADMINISTRATOR" || raw.toLowerCase() === "administrator") return "ADMIN" as UserRole;

  return upper as UserRole;
}

export function signAuthToken(claims: AuthTokenClaims) {
  // upiši normalizovanu rolu u token
  const normalized: AuthTokenClaims = { ...claims, role: normalizeRole(claims.role) };

  return jwt.sign(normalized, JWT_SECRET, { algorithm: "HS256", expiresIn: "7d" });
}

export function verifyAuthToken(token: string): AuthTokenClaims {
  const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & Partial<AuthTokenClaims>;

  if (!payload || !payload.sub || !payload.email || !payload.role) {
    throw new Error("Invalid token");
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name ?? "",
    role: normalizeRole(payload.role),
  };
}

export function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

/** Vrati ulogu iz cookie-a (server-side) */
export async function getRoleFromCookies(): Promise<UserRole | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const claims = verifyAuthToken(token);
    return claims.role; // već normalizovano
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
      role: claims.role, // već normalizovano
    };
  } catch {
    return null;
  }
}

type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; status: 401 | 403; message: string };

export async function requireAuth(allowedRoles?: UserRole[]): Promise<AuthResult> {
  const user = await getAuthUserFromCookies();

  if (!user) {
    return { ok: false, status: 401, message: "Niste prijavljeni" };
  }

  const userRole = normalizeRole(user.role);
  const normalizedUser: AuthUser = { ...user, role: userRole };

  if (allowedRoles && allowedRoles.length > 0) {
    const allowed = allowedRoles.map((r) => normalizeRole(r));
    if (!allowed.includes(userRole)) {
      return { ok: false, status: 403, message: "Nemate pravo pristupa" };
    }
  }

  return { ok: true, user: normalizedUser };
}
