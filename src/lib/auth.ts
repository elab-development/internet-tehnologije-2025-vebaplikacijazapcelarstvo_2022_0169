import { cookies } from "next/headers";
import type { UserRole } from "@/lib/types";

export async function getRoleFromCookies(): Promise<UserRole | null> {
  const cookieStore = await cookies();

  const role = cookieStore.get("role")?.value;

  if (!role) return null;

  if (
    role === "ADMIN" ||
    role === "PCELAR" ||
    role === "POLJOPRIVREDNIK"
  ) {
    return role as UserRole;
  }

  return null;
}

