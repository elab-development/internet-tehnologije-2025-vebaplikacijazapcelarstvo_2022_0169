import { db } from "@/db";
import { korisnici } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";
import type { AuthUser, LoginDTO, UserRole } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginDTO;
    const email = body.email?.trim();
    const password = body.password ?? body.sifra; // podrži oba

    if (!email || !password) {
      return NextResponse.json({ error: "Pogrešan email ili lozinka" }, { status: 401 });
    }

    const [u] = await db.select().from(korisnici).where(eq(korisnici.email, email));
    if (!u) {
      return NextResponse.json({ error: "Pogrešan email ili lozinka" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, u.sifra);
    if (!ok) {
      return NextResponse.json({ error: "Pogrešan email ili lozinka" }, { status: 401 });
    }

    const role = (String(u.uloga ?? "PCELAR").toUpperCase() as UserRole)
      .replace("ADMINISTRATOR" as any, "ADMIN") as UserRole;

    const token = signAuthToken({ sub: u.id, email: u.email, name: u.ime, role });

    const user: AuthUser = { id: u.id, email: u.email, name: u.ime, role };

    const res = NextResponse.json(user);
    res.cookies.set(AUTH_COOKIE, token, cookieOpts());
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server trenutno nije dostupan" }, { status: 500 });
  }
}
