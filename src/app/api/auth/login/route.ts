/**
 * @openapi
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required: [email]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "jana@mail.com"
 *         password:
 *           type: string
 *           description: Lozinka korisnika (može i kao 'sifra')
 *           example: "tajna123"
 *         sifra:
 *           type: string
 *           description: Alternativno polje za lozinku
 *           example: "tajna123"
 *     AuthUser:
 *       type: object
 *       required: [id, email, name, role]
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [ADMIN, PCELAR, POLJOPRIVREDNIK]
 *
 * /api/auth/login:
 *   post:
 *     summary: Prijava korisnika
 *     description: |
 *       Autentifikacija korisnika na osnovu emaila i lozinke.
 *       Ako su podaci ispravni, postavlja HTTP-only auth cookie i vraća podatke o korisniku.
 *     security: []   # login ne zahteva auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginRequest"
 *     responses:
 *       200:
 *         description: Uspešna prijava
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AuthUser"
 *       401:
 *         description: Pogrešan email ili lozinka
 *       500:
 *         description: Greška na serveru
 */


import { db } from "@/db";
import { korisnici } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { AUTH_COOKIE, cookieOpts, signAuthToken } from "@/lib/auth";
import type { AuthUser, LoginDTO, UserRole } from "@/shared/types";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginDTO;
    const email = body.email?.trim();
    const password = body.password ?? body.sifra; 

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
