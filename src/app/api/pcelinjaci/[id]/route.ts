import { NextResponse } from "next/server";
import { db } from "@/db";
import { pcelinjaci, kosnice } from "@/db/schema";
import { eq } from "drizzle-orm";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, ctx: Ctx) {
    const { id } = await ctx.params; 

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
            geoSirina: geoSirina == null || Number.isNaN(geoSirina) ? null : String(geoSirina),
            geoDuzina: geoDuzina == null || Number.isNaN(geoDuzina) ? null : String(geoDuzina),
        })
        .where(eq(pcelinjaci.id, id));

    return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
    const { id } = await ctx.params;

    await db.delete(kosnice).where(eq(kosnice.pcelinjakId, id));
    await db.delete(pcelinjaci).where(eq(pcelinjaci.id, id));

    return NextResponse.json({ ok: true });
}
