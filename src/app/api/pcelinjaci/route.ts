import { NextResponse } from "next/server";
import { db } from "@/db";
import { pcelinjaci } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, AuthError } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth(["PCELAR"]); 

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
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(["PCELAR"]);  

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
      geoSirina:
        geoSirina == null || Number.isNaN(geoSirina) ? null : String(geoSirina),
      geoDuzina:
        geoDuzina == null || Number.isNaN(geoDuzina) ? null : String(geoDuzina),
      vlasnikId: user.id,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    if (e instanceof AuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
  }
}

