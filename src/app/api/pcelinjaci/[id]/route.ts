import { NextResponse } from "next/server";
import { db } from "@/db";
import { pcelinjaci, kosnice } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthError } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth(["PCELAR"]); 
    const { id } = await ctx.params;

    
    const existing = await db
      .select({ id: pcelinjaci.id })
      .from(pcelinjaci)
      .where(and(eq(pcelinjaci.id, id), eq(pcelinjaci.vlasnikId, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Pčelinjak nije pronađen ili nemate pravo pristupa" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const naziv = String(body.naziv ?? "").trim();
    const adresa = String(body.adresa ?? "").trim();
    const geoSirina = body.geoSirina == null ? null : Number(body.geoSirina);
    const geoDuzina = body.geoDuzina == null ? null : Number(body.geoDuzina);

    if (!naziv) {
      return NextResponse.json({ error: "Naziv je obavezan" }, { status: 400 });
    }

    await db
      .update(pcelinjaci)
      .set({
        naziv,
        adresa: adresa || null,
        geoSirina:
          geoSirina == null || Number.isNaN(geoSirina) ? null : String(geoSirina),
        geoDuzina:
          geoDuzina == null || Number.isNaN(geoDuzina) ? null : String(geoDuzina),
      })
      .where(and(eq(pcelinjaci.id, id), eq(pcelinjaci.vlasnikId, user.id))); 

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const user = await requireAuth(["PCELAR"]); 
    const { id } = await ctx.params;

    
    const existing = await db
      .select({ id: pcelinjaci.id })
      .from(pcelinjaci)
      .where(and(eq(pcelinjaci.id, id), eq(pcelinjaci.vlasnikId, user.id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Pčelinjak nije pronađen ili nemate pravo pristupa" },
        { status: 404 }
      );
    }

    
    await db.delete(kosnice).where(eq(kosnice.pcelinjakId, id));
    await db
      .delete(pcelinjaci)
      .where(and(eq(pcelinjaci.id, id), eq(pcelinjaci.vlasnikId, user.id))); 

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}
