/**
 * @openapi
 * /api/korisnici/{id}:
 *   get:
 *     summary: Detalji korisnika (samo ADMIN)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Nije pronađen }
 *
 *   put:
 *     summary: Izmena korisnika (samo ADMIN)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ime, prezime, email, uloga]
 *             properties:
 *               ime: { type: string }
 *               prezime: { type: string }
 *               email: { type: string }
 *               uloga:
 *                 type: string
 *                 enum: [ADMIN, PCELAR, POLJOPRIVREDNIK]
 *               sifra:
 *                 type: string
 *                 description: Nova šifra (opciono)
 *     responses:
 *       200: { description: OK }
 *       400: { description: Greška u podacima }
 *
 *   delete:
 *     summary: Brisanje korisnika (samo ADMIN)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Obrisano }
 *       404: { description: Nije pronađen }
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { korisnici } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { requireAuth } from "@/lib/auth";
import type { UserRole } from "@/shared/types";

type Ctx = { params: Promise<{ id: string }> };

function normalizeRole(v: unknown): UserRole {
  const s = String(v ?? "").toUpperCase();
  if (s === "ADMIN" || s === "PCELAR" || s === "POLJOPRIVREDNIK") return s as UserRole;
  return "POLJOPRIVREDNIK";
}

export async function GET(_: Request, ctx: Ctx) {
  const auth = await requireAuth(["ADMIN"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await ctx.params;

  const rows = await db.select().from(korisnici).where(eq(korisnici.id, id));
  if (rows.length === 0) {
    return NextResponse.json({ error: "Korisnik nije pronađen" }, { status: 404 });
  }

  const { sifra, ...out } = rows[0];
  return NextResponse.json(out);
}

export async function PUT(req: Request, ctx: Ctx) {
  const auth = await requireAuth(["ADMIN"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await ctx.params;
  const body = await req.json();

  const ime = String(body.ime ?? "").trim();
  const prezime = String(body.prezime ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const uloga = normalizeRole(body.uloga);
  const sifra = String(body.sifra ?? "").trim();

  if (!ime || !prezime || !email) {
    return NextResponse.json({ error: "Nedostaju podaci" }, { status: 400 });
  }

  const update: any = { ime, prezime, email, uloga };
  if (sifra) update.sifra = await bcrypt.hash(sifra, 10);

  const updated = await db
    .update(korisnici)
    .set(update)
    .where(eq(korisnici.id, id))
    .returning();

  if (updated.length === 0) {
    return NextResponse.json({ error: "Korisnik nije pronađen" }, { status: 404 });
  }

  const { sifra: _, ...out } = updated[0];
  return NextResponse.json(out);
}

export async function DELETE(_: Request, ctx: Ctx) {
  const auth = await requireAuth(["ADMIN"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await ctx.params;

  const deleted = await db
    .delete(korisnici)
    .where(eq(korisnici.id, id))
    .returning();

  if (deleted.length === 0) {
    return NextResponse.json({ error: "Korisnik nije pronađen" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}