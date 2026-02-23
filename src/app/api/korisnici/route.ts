/**
 * @openapi
 * /api/korisnici:
 *   get:
 *     summary: Lista korisnika (samo ADMIN)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Pretraga po imenu, prezimenu ili email-u
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, PCELAR, POLJOPRIVREDNIK]
 *     responses:
 *       200: { description: OK }
 *       403: { description: Zabranjeno }
 *
 *   post:
 *     summary: Kreiranje novog korisnika (samo ADMIN)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ime, prezime, email, sifra, uloga]
 *             properties:
 *               ime: { type: string }
 *               prezime: { type: string }
 *               email: { type: string }
 *               sifra: { type: string }
 *               uloga:
 *                 type: string
 *                 enum: [ADMIN, PCELAR, POLJOPRIVREDNIK]
 *     responses:
 *       201: { description: Kreirano }
 *       400: { description: Greška u podacima }
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { korisnici } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { requireAuth } from "@/lib/auth";
import type { UserRole } from "@/shared/types";

function normalizeRole(v: unknown): UserRole {
  const s = String(v ?? "").toUpperCase();
  if (s === "ADMIN" || s === "PCELAR" || s === "POLJOPRIVREDNIK") return s as UserRole;
  return "POLJOPRIVREDNIK";
}

export async function GET(req: Request) {
  const auth = await requireAuth(["ADMIN"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const q = String(searchParams.get("q") ?? "").toLowerCase();
  const role = String(searchParams.get("role") ?? "").toUpperCase();

  let rows = await db
    .select({
      id: korisnici.id,
      ime: korisnici.ime,
      prezime: korisnici.prezime,
      email: korisnici.email,
      uloga: korisnici.uloga,
      createdAt: korisnici.createdAt,
    })
    .from(korisnici)
    .orderBy(asc(korisnici.prezime), asc(korisnici.ime));

  if (role) rows = rows.filter((r) => r.uloga === role);
  if (q) {
    rows = rows.filter((r) =>
      `${r.ime} ${r.prezime} ${r.email}`.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const auth = await requireAuth(["ADMIN"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await req.json();

  const ime = String(body.ime ?? "").trim();
  const prezime = String(body.prezime ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const sifra = String(body.sifra ?? "").trim();
  const uloga = normalizeRole(body.uloga);

  if (!ime || !prezime || !email || !sifra) {
    return NextResponse.json({ error: "Nedostaju podaci" }, { status: 400 });
  }

  const exists = await db.select().from(korisnici).where(eq(korisnici.email, email));
  if (exists.length > 0) {
    return NextResponse.json({ error: "Email već postoji" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(sifra, 10);

  await db.insert(korisnici).values({
    ime,
    prezime,
    email,
    sifra: hashed,
    uloga,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}