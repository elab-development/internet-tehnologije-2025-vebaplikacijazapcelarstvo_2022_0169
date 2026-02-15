/**
 * @openapi
 * /api/pcelinjaci/{id}/kosnice:
 *   get:
 *     summary: Lista košnica za pčelinjak (PCELAR)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Pčelinjak nije pronađen ili nemaš pravo pristupa }
 *       500: { description: Greška pri učitavanju košnica }
 *
 *   post:
 *     summary: Kreiranje košnice u pčelinjaku (PCELAR)
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
 *             required: [broj]
 *             properties:
 *               broj: { type: integer, example: 12 }
 *               tip: { type: string, nullable: true, example: "LR" }
 *               starostMatice: { type: integer, nullable: true, example: 2 }
 *               brNastavaka: { type: integer, nullable: true, example: 3 }
 *               datum:
 *                 type: string
 *                 nullable: true
 *                 description: Datum (ISO ili YYYY-MM-DD). Ako nije unet, server postavlja današnji datum.
 *                 example: "2026-03-01"
 *     responses:
 *       201: { description: Kreirano }
 *       400: { description: Neispravni podaci ili duplikat broja }
 *       404: { description: Pčelinjak nije pronađen ili nemaš pravo pristupa }
 *       500: { description: Greška pri kreiranju košnice }
 */


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { kosnice, pcelinjaci } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

import type { KosnicaCreateDTO } from "@/shared/types";

type Ctx = { params: Promise<{ id: string }> };

function toNumberOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toStringOrNull(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function toDateOrDefault(v: unknown): Date {
  if (v == null || v === "") return new Date();
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

async function assertOwnsPcelinjak(pcelinjakId: string, userId: string) {
  const rows = await db
    .select({ id: pcelinjaci.id })
    .from(pcelinjaci)
    .where(and(eq(pcelinjaci.id, pcelinjakId), eq(pcelinjaci.vlasnikId, userId)))
    .limit(1);

  return rows.length > 0;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAuth(["PCELAR"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const user = auth.user;
    const { id: pcelinjakId } = await ctx.params;

    const ok = await assertOwnsPcelinjak(pcelinjakId, user.id);
    if (!ok) {
      return NextResponse.json(
        { error: "Pčelinjak nije pronađen ili nemate pravo pristupa" },
        { status: 404 }
      );
    }

    const rows = await db
      .select()
      .from(kosnice)
      .where(eq(kosnice.pcelinjakId, pcelinjakId))
      .orderBy(asc(kosnice.broj));

    return NextResponse.json(rows);
  } catch (e: any) {
    console.error("GET kosnice error:", e);
    return NextResponse.json(
      { error: "Greška pri učitavanju košnica" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await requireAuth(["PCELAR"]);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  try {
    const user = auth.user;
    const { id: pcelinjakId } = await ctx.params;

    const ok = await assertOwnsPcelinjak(pcelinjakId, user.id);
    if (!ok) {
      return NextResponse.json(
        { error: "Pčelinjak nije pronađen ili nemate pravo pristupa" },
        { status: 404 }
      );
    }

    const body = (await req.json()) as Partial<KosnicaCreateDTO>;

    const broj = Number(body.broj);
    if (!Number.isFinite(broj) || broj <= 0) {
      return NextResponse.json(
        { error: "Broj košnice mora biti pozitivan broj" },
        { status: 400 }
      );
    }

    const tip = toStringOrNull(body.tip);
    const starostMatice = toNumberOrNull(body.starostMatice);
    const brNastavaka = toNumberOrNull(body.brNastavaka);
    const datum = toDateOrDefault(body.datum);

    const exists = await db
      .select({ broj: kosnice.broj })
      .from(kosnice)
      .where(and(eq(kosnice.pcelinjakId, pcelinjakId), eq(kosnice.broj, broj)))
      .limit(1);

    if (exists.length > 0) {
      return NextResponse.json(
        { error: "Košnica sa tim brojem već postoji u ovom pčelinjaku" },
        { status: 400 }
      );
    }

    await db.insert(kosnice).values({
      broj,
      tip,
      datum,
      starostMatice,
      brNastavaka,
      pcelinjakId,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    console.error("POST kosnice error:", e);
    return NextResponse.json(
      { error: "Greška pri kreiranju košnice" },
      { status: 500 }
    );
  }
}
