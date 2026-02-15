/**
 * @openapi
 * /api/dnevnici/{id}:
 *   put:
 *     summary: Izmena unosa u dnevnik (PCELAR)
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
 *             properties:
 *               kosnicaId: { type: string, format: uuid }
 *               datum: { type: string, format: date-time, nullable: true }
 *               kolicinaMeda: { type: number, nullable: true }
 *               pregled: { type: string, nullable: true }
 *               komentar: { type: string, nullable: true }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Unos nije pronađen ili nemaš pravo pristupa }
 *
 *   delete:
 *     summary: Brisanje unosa u dnevnik (PCELAR)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Unos nije pronađen ili nemaš pravo pristupa }
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { dnevnici, kosnice, pcelinjaci } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

function toStringOrNull(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function toNumberOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toDateOrNull(v: unknown): Date | null {
  if (v == null || v === "") return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

async function canAccessDnevnik(dnevnikId: string, vlasnikId: string) {
  const found = await db
    .select({ id: dnevnici.id, kosnicaId: dnevnici.kosnicaId })
    .from(dnevnici)
    .innerJoin(kosnice, eq(kosnice.id, dnevnici.kosnicaId))
    .innerJoin(pcelinjaci, eq(pcelinjaci.id, kosnice.pcelinjakId))
    .where(and(eq(dnevnici.id, dnevnikId), eq(pcelinjaci.vlasnikId, vlasnikId)))
    .limit(1);

  return found.length ? found[0] : null;
}

async function assertOwnsKosnica(kosnicaId: string, vlasnikId: string) {
  const found = await db
    .select({ id: kosnice.id })
    .from(kosnice)
    .innerJoin(pcelinjaci, eq(pcelinjaci.id, kosnice.pcelinjakId))
    .where(and(eq(kosnice.id, kosnicaId), eq(pcelinjaci.vlasnikId, vlasnikId)))
    .limit(1);

  return found.length > 0;
}

export async function PUT(req: Request, ctx: Ctx) {
  const auth = await requireAuth(["PCELAR"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await ctx.params;

  const access = await canAccessDnevnik(id, auth.user.id);
  if (!access) {
    return NextResponse.json(
      { error: "Unos nije pronađen ili nemate pravo pristupa" },
      { status: 404 }
    );
  }

  const body = await req.json();

  const nextKosnicaId = String(body.kosnicaId ?? "").trim();
  if (nextKosnicaId) {
    const ok = await assertOwnsKosnica(nextKosnicaId, auth.user.id);
    if (!ok) {
      return NextResponse.json(
        { error: "Košnica nije pronađena ili nemate pravo pristupa" },
        { status: 404 }
      );
    }
  }

  const datum = body.datum === null ? null : toDateOrNull(body.datum);
  const pregled = body.pregled === null ? null : toStringOrNull(body.pregled);
  const komentar = body.komentar === null ? null : toStringOrNull(body.komentar);
  const kolicinaMedaNum = body.kolicinaMeda === null ? null : toNumberOrNull(body.kolicinaMeda);

  await db
    .update(dnevnici)
    .set({
      kosnicaId: nextKosnicaId || undefined,
      datum: datum === null ? null : datum ?? undefined,
      pregled,
      komentar,
      kolicinaMeda: kolicinaMedaNum == null ? null : String(kolicinaMedaNum),
    })
    .where(eq(dnevnici.id, id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const auth = await requireAuth(["PCELAR"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const { id } = await ctx.params;

  const access = await canAccessDnevnik(id, auth.user.id);
  if (!access) {
    return NextResponse.json(
      { error: "Unos nije pronađen ili nemate pravo pristupa" },
      { status: 404 }
    );
  }

  await db.delete(dnevnici).where(eq(dnevnici.id, id));

  return NextResponse.json({ ok: true });
}
