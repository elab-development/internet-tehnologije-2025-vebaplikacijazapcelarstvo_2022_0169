import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/db";
import { kosnice } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";

import type { KosnicaUpdateDTO } from "@/shared/types";

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

function toDateOrNull(v: unknown): Date | null {
  if (v == null || v === "") return null;
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    const { id: kosnicaId } = await ctx.params;
    const body = (await req.json()) as KosnicaUpdateDTO;

    
    const existing = await db.select().from(kosnice).where(eq(kosnice.id, kosnicaId));
    const cur = existing[0];
    if (!cur) return NextResponse.json({ error: "Košnica ne postoji" }, { status: 404 });

    const patch: Record<string, any> = {};

    if (body.broj !== undefined) {
      const broj = Number(body.broj);
      if (!Number.isFinite(broj) || broj <= 0) {
        return NextResponse.json(
          { error: "Broj košnice mora biti pozitivan broj" },
          { status: 400 }
        );
      }

      
      const dup = await db
        .select({ id: kosnice.id })
        .from(kosnice)
        .where(
          and(
            eq(kosnice.pcelinjakId, cur.pcelinjakId),
            eq(kosnice.broj, broj),
            ne(kosnice.id, kosnicaId)
          )
        );

      if (dup.length > 0) {
        return NextResponse.json(
          { error: "Košnica sa tim brojem već postoji u ovom pčelinjaku" },
          { status: 400 }
        );
      }

      patch.broj = broj;
    }

    if (body.tip !== undefined) patch.tip = toStringOrNull(body.tip);
    if (body.starostMatice !== undefined) patch.starostMatice = toNumberOrNull(body.starostMatice);
    if (body.brNastavaka !== undefined) patch.brNastavaka = toNumberOrNull(body.brNastavaka);

    if (body.datum !== undefined) {
      const d = toDateOrNull(body.datum);
      if (d === null) return NextResponse.json({ error: "Neispravan datum" }, { status: 400 });
      patch.datum = d;
    }

    if (Object.keys(patch).length === 0) return NextResponse.json({ ok: true });

    await db.update(kosnice).set(patch).where(eq(kosnice.id, kosnicaId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/kosnice/[id] error:", e);
    return NextResponse.json({ error: "Greška pri izmeni košnice" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const { id: kosnicaId } = await ctx.params;

    await db.delete(kosnice).where(eq(kosnice.id, kosnicaId));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/kosnice/[id] error:", e);
    return NextResponse.json({ error: "Greška pri brisanju košnice" }, { status: 500 });
  }
}
