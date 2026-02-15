/**
 * @openapi
 * /api/dnevnici:
 *   get:
 *     summary: Lista dnevnika (PCELAR) filtrirano po pčelinjaku/košnici
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: pcelinjakId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: kosnicaId
 *         required: false
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: sort
 *         required: false
 *         schema:
 *           type: string
 *           enum: [datum_desc, datum_asc]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: string, format: uuid }
 *                   datum: { type: string, format: date-time }
 *                   kolicinaMeda: { type: number, nullable: true }
 *                   pregled: { type: string, nullable: true }
 *                   komentar: { type: string, nullable: true }
 *                   kosnicaId: { type: string, format: uuid }
 *       400: { description: pcelinjakId je obavezan }
 *
 *   post:
 *     summary: Kreiranje novog unosa u dnevnik (PCELAR)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [kosnicaId]
 *             properties:
 *               kosnicaId: { type: string, format: uuid }
 *               datum: { type: string, format: date-time, nullable: true }
 *               kolicinaMeda: { type: number, nullable: true }
 *               pregled: { type: string, nullable: true }
 *               komentar: { type: string, nullable: true }
 *     responses:
 *       201: { description: Kreirano }
 *       400: { description: kosnicaId je obavezan / neispravni podaci }
 *       404: { description: Košnica nije pronađena ili nemaš pravo pristupa }
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { dnevnici, kosnice, pcelinjaci } from "@/db/schema";
import { and, desc, eq, asc } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

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

async function assertOwnsKosnica(kosnicaId: string, vlasnikId: string) {
  const found = await db
    .select({ id: kosnice.id })
    .from(kosnice)
    .innerJoin(pcelinjaci, eq(pcelinjaci.id, kosnice.pcelinjakId))
    .where(and(eq(kosnice.id, kosnicaId), eq(pcelinjaci.vlasnikId, vlasnikId)))
    .limit(1);

  return found.length > 0;
}

export async function GET(req: Request) {
  const auth = await requireAuth(["PCELAR"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const url = new URL(req.url);
  const pcelinjakId = String(url.searchParams.get("pcelinjakId") ?? "").trim();
  const kosnicaId = String(url.searchParams.get("kosnicaId") ?? "").trim();
  const sort = String(url.searchParams.get("sort") ?? "datum_desc").trim();

  if (!pcelinjakId) {
    return NextResponse.json({ error: "pcelinjakId je obavezan" }, { status: 400 });
  }

  const ownsP = await db
    .select({ id: pcelinjaci.id })
    .from(pcelinjaci)
    .where(and(eq(pcelinjaci.id, pcelinjakId), eq(pcelinjaci.vlasnikId, auth.user.id)))
    .limit(1);

  if (ownsP.length === 0) {
    return NextResponse.json(
      { error: "Pčelinjak nije pronađen ili nemate pravo pristupa" },
      { status: 404 }
    );
  }

  const whereParts = [eq(pcelinjaci.id, pcelinjakId), eq(pcelinjaci.vlasnikId, auth.user.id)];

  const orderBy = sort === "datum_asc" ? asc(dnevnici.datum) : desc(dnevnici.datum);

  const rows = await db
    .select({
      id: dnevnici.id,
      datum: dnevnici.datum,
      kolicinaMeda: dnevnici.kolicinaMeda,
      pregled: dnevnici.pregled,
      komentar: dnevnici.komentar,
      kosnicaId: dnevnici.kosnicaId,
    })
    .from(dnevnici)
    .innerJoin(kosnice, eq(kosnice.id, dnevnici.kosnicaId))
    .innerJoin(pcelinjaci, eq(pcelinjaci.id, kosnice.pcelinjakId))
    .where(kosnicaId ? and(...whereParts, eq(kosnice.id, kosnicaId)) : and(...whereParts))
    .orderBy(orderBy);

  const out = rows.map((r) => ({
    id: r.id,
    datum: (r.datum ?? new Date()).toISOString(),
    kolicinaMeda: r.kolicinaMeda == null ? null : Number(r.kolicinaMeda),
    pregled: r.pregled ?? null,
    komentar: r.komentar ?? null,
    kosnicaId: r.kosnicaId,
  }));

  return NextResponse.json(out);
}

export async function POST(req: Request) {
  const auth = await requireAuth(["PCELAR"]);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });

  const body = await req.json();

  const kosnicaId = String(body.kosnicaId ?? "").trim();
  if (!kosnicaId) {
    return NextResponse.json({ error: "kosnicaId je obavezan" }, { status: 400 });
  }

  const ok = await assertOwnsKosnica(kosnicaId, auth.user.id);
  if (!ok) {
    return NextResponse.json(
      { error: "Košnica nije pronađena ili nemate pravo pristupa" },
      { status: 404 }
    );
  }

  const datum = toDateOrNull(body.datum);
  const pregled = toStringOrNull(body.pregled);
  const komentar = toStringOrNull(body.komentar);
  const kolicinaMedaNum = toNumberOrNull(body.kolicinaMeda);

  await db.insert(dnevnici).values({
    kosnicaId,
    datum: datum ?? undefined, 
    pregled,
    komentar,
    kolicinaMeda: kolicinaMedaNum == null ? null : String(kolicinaMedaNum),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
