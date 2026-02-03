import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import type { ReactNode } from "react";
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

export default async function PcelinjaciLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  const role = token ? getRoleFromToken(token) : null;

  if (!token || !role) {
    redirect("/"); // ili "/prijava"
  }

  return <>{children}</>;
}
