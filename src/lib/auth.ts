import * as jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { AuthTokenClaims, AuthUser, UserRole } from "@/shared/types";

export const AUTH_COOKIE = "auth";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET in env file");
  }
  return secret;
}


export function signAuthToken(claims: AuthTokenClaims) {
  return jwt.sign(claims, getJwtSecret(), { algorithm: "HS256", expiresIn: "7d" });
}


export function verifyAuthToken(token: string): AuthTokenClaims {
  const payload = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload & Partial<AuthTokenClaims>;

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


export function cookieOpts() {
  const secure = process.env.COOKIE_SECURE === "true"; 

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}



export async function getRoleFromCookies(): Promise<UserRole | null> {
  const cookieStore = await cookies();
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

type AuthResult =
  | { ok: true; user: AuthUser }
  | { ok: false; status: 401 | 403; message: string };

export async function requireAuth(
  allowedRoles?: UserRole[]
): Promise<AuthResult> {
  const user = await getAuthUserFromCookies();

  if (!user) {
    return { ok: false, status: 401, message: "Niste prijavljeni" };
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return { ok: false, status: 403, message: "Nemate pravo pristupa" };
  }

  return { ok: true, user };
}
