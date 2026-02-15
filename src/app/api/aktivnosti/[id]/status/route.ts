/**
 * @openapi
 * components:
 *   schemas:
 *     AktivnostUradjenRequest:
 *       type: object
 *       properties:
 *         uradjen:
 *           type: boolean
 *           description: Da li je aktivnost označena kao urađena za trenutno ulogovanog korisnika
 *           example: true
 *     AktivnostUradjenResponse:
 *       type: object
 *       required: [ok, uradjen]
 *       properties:
 *         ok: { type: boolean, example: true }
 *         uradjen: { type: boolean, example: true }
 *
 * /api/aktivnosti/{id}/uradjen:
 *   patch:
 *     summary: Označavanje aktivnosti kao urađene / neurađene (per-user)
 *     description: |
 *       Upisuje ili ažurira status "uradjen" za trenutno ulogovanog korisnika i datu aktivnost.
 *       Radi UPSERT (insert ili update) nad tabelom korisnikAktivnosti.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID aktivnosti
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/AktivnostUradjenRequest"
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AktivnostUradjenResponse"
 *       401:
 *         description: Neautorizovano
 *       403:
 *         description: Zabranjeno (uloga nema pristup)
 */


import { NextResponse } from "next/server";
import { db } from "@/db";
import { korisnikAktivnosti } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth(["PCELAR", "POLJOPRIVREDNIK", "ADMIN"]);
    if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

    const { id: aktivnostId } = await ctx.params;

    const body = await req.json().catch(() => ({}));
    const uradjen = body?.uradjen === true;

    await db
        .insert(korisnikAktivnosti)
        .values({
            korisnikId: auth.user.id,
            aktivnostId,
            uradjen,
            uradjenAt: uradjen ? new Date() : null,
        })
        .onConflictDoUpdate({
            target: [korisnikAktivnosti.korisnikId, korisnikAktivnosti.aktivnostId],
            set: {
                uradjen,
                uradjenAt: uradjen ? new Date() : null,
            },
        });

    const row = await db
        .select({ uradjen: korisnikAktivnosti.uradjen })
        .from(korisnikAktivnosti)
        .where(and(eq(korisnikAktivnosti.korisnikId, auth.user.id), eq(korisnikAktivnosti.aktivnostId, aktivnostId)));

    return NextResponse.json({ ok: true, uradjen: row[0]?.uradjen === true });
}
