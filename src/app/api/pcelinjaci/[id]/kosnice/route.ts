import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { kosnice } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

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

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id: pcelinjakId } = await ctx.params;

    const rows = await db
      .select()
      .from(kosnice)
      .where(eq(kosnice.pcelinjakId, pcelinjakId))
      .orderBy(asc(kosnice.broj));

    return NextResponse.json(rows);
  } catch (e) {
    console.error("GET kosnice error:", e);
    return NextResponse.json(
      { error: "Greška pri učitavanju košnica" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const { id: pcelinjakId } = await ctx.params;
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
      .where(eq(kosnice.pcelinjakId, pcelinjakId));

    if (exists.some((k) => k.broj === broj)) {
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
  } catch (e) {
    console.error("POST kosnice error:", e);
    return NextResponse.json(
      { error: "Greška pri kreiranju košnice" },
      { status: 500 }
    );
  }
}

