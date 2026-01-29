import { db } from "@/db";
import { korisnici } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";
import type { AuthUser, RegisterDTO, UserRole } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterDTO;
    const { ime, prezime, email, sifra } = body;

    if (!ime || !prezime || !email || !sifra) {
      return NextResponse.json({ error: "Nedostaju podaci" }, { status: 400 });
    }

    const exists = await db.select().from(korisnici).where(eq(korisnici.email, email));
    if (exists.length > 0) {
      return NextResponse.json({ error: "Email postoji u bazi" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(sifra, 10);
    const id = crypto.randomUUID();

    const role: UserRole = (body.uloga ?? "PCELAR");

    await db.insert(korisnici).values({
      id,
      ime,
      prezime,
      email,
      sifra: hashed,
      uloga: role,
    });

    const token = signAuthToken({ sub: id, email, name: ime, role });

    const user: AuthUser = { id, email, name: ime, role };
    const res = NextResponse.json(user);
    res.cookies.set(AUTH_COOKIE, token, cookieOpts());
    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server trenutno nije dostupan" }, { status: 500 });
  }
}
