import { NextResponse } from "next/server";
import { db } from "@/db";
import { pcelinjaci } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUserFromCookies } from "@/lib/auth";

export async function GET() {
    const user = await getAuthUserFromCookies();
    if (!user) {
        return NextResponse.json({ error: "Niste prijavljeni" }, { status: 401 });
    }

    const rows = await db
        .select()
        .from(pcelinjaci)
        .where(eq(pcelinjaci.vlasnikId, user.id));

    const out = rows.map((r) => ({
        id: r.id,
        naziv: r.naziv,
        adresa: r.adresa ?? "",
        geoSirina: r.geoSirina == null ? null : Number(r.geoSirina),
        geoDuzina: r.geoDuzina == null ? null : Number(r.geoDuzina),
    }));

    return NextResponse.json(out);
}

export async function POST(req: Request) {
    const user = await getAuthUserFromCookies();
    if (!user) {
        return NextResponse.json({ error: "Niste prijavljeni" }, { status: 401 });
    }

    const body = await req.json();

    const naziv = String(body.naziv ?? "").trim();
    const adresa = String(body.adresa ?? "").trim();
    const geoSirina = body.geoSirina == null ? null : Number(body.geoSirina);
    const geoDuzina = body.geoDuzina == null ? null : Number(body.geoDuzina);

    if (!naziv) {
        return NextResponse.json({ error: "Naziv je obavezan" }, { status: 400 });
    }

    await db.insert(pcelinjaci).values({
        naziv,
        adresa: adresa || null,
        geoSirina: geoSirina == null || Number.isNaN(geoSirina) ? null : String(geoSirina),
        geoDuzina: geoDuzina == null || Number.isNaN(geoDuzina) ? null : String(geoDuzina),
        vlasnikId: user.id,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
}
