/**
 * @openapi
 * components:
 *   schemas:
 *     AktivnostUpdateRequest:
 *       type: object
 *       required: [naziv]
 *       properties:
 *         naziv:
 *           type: string
 *           example: "Ažuriran naziv aktivnosti"
 *         opis:
 *           type: string
 *           nullable: true
 *           example: "Izmenjen opis aktivnosti"
 *         datum:
 *           type: string
 *           nullable: true
 *           description: Datum u formatu YYYY-MM-DD
 *           example: "2026-03-01"
 *
 * /api/aktivnosti/{id}:
 *   put:
 *     summary: Izmena postojeće aktivnosti
 *     description: |
 *       Menja naziv, opis i datum aktivnosti.
 *       - ADMIN može menjati bilo koju aktivnost
 *       - PCELAR / POLJOPRIVREDNIK mogu menjati samo svoje aktivnosti
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/AktivnostUpdateRequest"
 *     responses:
 *       200:
 *         description: Uspešno izmenjeno
 *       400:
 *         description: Neispravan zahtev (naziv je obavezan)
 *       401:
 *         description: Neautorizovano
 *       403:
 *         description: Nemaš pravo izmene ove aktivnosti
 *       404:
 *         description: Aktivnost ne postoji
 *
 *   delete:
 *     summary: Brisanje aktivnosti
 *     description: |
 *       Briše aktivnost.
 *       - ADMIN može obrisati bilo koju
 *       - Ostali mogu obrisati samo svoje aktivnosti
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Uspešno obrisano
 *       401:
 *         description: Neautorizovano
 *       403:
 *         description: Nemaš pravo brisanja ove aktivnosti
 */


import { NextResponse } from "next/server";
import { db } from "@/db";
import { aktivnosti } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth(["PCELAR", "POLJOPRIVREDNIK", "ADMIN"]);
    if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

    const { id } = await ctx.params;

    // admin prepoznajemo strogo (posle normalizeRole u auth.ts ovo je dovoljno)
    const isAdmin = auth.user.role === "ADMIN";

    // Ako nije admin, može menjati samo svoje
    if (!isAdmin) {
        const own = await db
            .select({ id: aktivnosti.id })
            .from(aktivnosti)
            .where(and(eq(aktivnosti.id, id), eq(aktivnosti.creatorId, auth.user.id)));

        if (own.length === 0) {
            return NextResponse.json({ message: "Ne možeš menjati ovu aktivnost." }, { status: 403 });
        }
    }

    const body = await req.json().catch(() => ({}));
    const naziv = String(body?.naziv ?? "").trim();
    const opis = body?.opis == null ? null : String(body.opis).trim();
    const datumStr = body?.datum == null ? null : String(body.datum).trim();

    if (!naziv) return NextResponse.json({ message: "Naziv je obavezan." }, { status: 400 });

    const datum = datumStr ? new Date(`${datumStr}T00:00:00`) : null;

    await db
        .update(aktivnosti)
        .set({ naziv, opis: opis === "" ? null : opis, datum })
        .where(eq(aktivnosti.id, id));

    return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth(["PCELAR", "POLJOPRIVREDNIK", "ADMIN"]);
    if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

    const { id } = await ctx.params;

    const isAdmin = auth.user.role === "ADMIN";

    const whereClause = isAdmin
        ? eq(aktivnosti.id, id) // ✅ admin briše bilo koju
        : and(eq(aktivnosti.id, id), eq(aktivnosti.creatorId, auth.user.id)); // ✅ ostali samo svoje

    const del = await db.delete(aktivnosti).where(whereClause).returning({ id: aktivnosti.id });

    if (del.length === 0) {
        return NextResponse.json({ message: "Ne možeš obrisati ovu aktivnost." }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
}
