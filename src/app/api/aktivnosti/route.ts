/**
 * @openapi
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: auth
 *   schemas:
 *     AktivnostTip:
 *       type: string
 *       enum: [SEZONSKA, PCELAR, POLJOPRIVREDNIK]
 *     AktivnostListItem:
 *       type: object
 *       required: [id, naziv, tip, datum, uradjen, canEdit, canDelete]
 *       properties:
 *         id: { type: string, format: uuid }
 *         naziv: { type: string }
 *         opis: { type: string, nullable: true }
 *         tip:
 *           $ref: "#/components/schemas/AktivnostTip"
 *         datum:
 *           type: string
 *           nullable: true
 *           description: ISO string (ili null ako nije unet datum)
 *           example: "2026-02-14T00:00:00.000Z"
 *         uradjen: { type: boolean }
 *         canEdit: { type: boolean }
 *         canDelete: { type: boolean }
 *     AktivnostCreateRequest:
 *       type: object
 *       required: [naziv]
 *       properties:
 *         naziv: { type: string, example: "Pregled kosnica" }
 *         opis: { type: string, nullable: true, example: "Detaljan pregled stanja" }
 *         datum:
 *           type: string
 *           nullable: true
 *           description: Datum u formatu YYYY-MM-DD (server dodaje T00:00:00)
 *           example: "2026-02-20"
 *     AktivnostCreateResponse:
 *       type: object
 *       required: [ok, id]
 *       properties:
 *         ok: { type: boolean, example: true }
 *         id: { type: string, format: uuid }
 *
 * /api/aktivnosti:
 *   get:
 *     summary: Lista aktivnosti vidljivih ulogovanom korisniku
 *     description: |
 *       Vraća aktivnosti sa pravima (canEdit/canDelete) i statusom uradjen za konkretnog korisnika.
 *       Filtriranje zavisi od uloge:
 *       - ADMIN: vidi sve
 *       - PCELAR/POLJOPRIVREDNIK: vidi SEZONSKA, POLJOPRIVREDNIK, i svoje (PCELAR + creatorId=userId) prema kodu.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/AktivnostListItem"
 *       401:
 *         description: Neautorizovano
 *       403:
 *         description: Zabranjeno (uloga nema pristup)
 *
 *   post:
 *     summary: Kreira novu aktivnost
 *     description: |
 *       Kreira aktivnost.
 *       - ADMIN kreira tip=SEZONSKA
 *       - PCELAR/POLJOPRIVREDNIK kreira tip=role
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/AktivnostCreateRequest"
 *     responses:
 *       200:
 *         description: Kreirano
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/AktivnostCreateResponse"
 *       400:
 *         description: Neispravan zahtev (npr. naziv je obavezan)
 *       401:
 *         description: Neautorizovano
 *       403:
 *         description: Zabranjeno (uloga nema pristup)
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { aktivnosti, korisnikAktivnosti } from "@/db/schema";
import { and, eq, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET() {
    const auth = await requireAuth(["PCELAR", "POLJOPRIVREDNIK", "ADMIN"]);
    if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

    const userId = auth.user.id;
    const role = auth.user.role; // već normalizovano u auth.ts
    const isAdmin = role === "ADMIN";

    const whereClause = isAdmin
        ? undefined
        : or(
            eq(aktivnosti.tip, "SEZONSKA"),
            eq(aktivnosti.tip, "POLJOPRIVREDNIK"),
            and(eq(aktivnosti.tip, "PCELAR"), eq(aktivnosti.creatorId, userId))
        );

    const q = db
        .select({
            id: aktivnosti.id,
            naziv: aktivnosti.naziv,
            opis: aktivnosti.opis,
            tip: aktivnosti.tip,
            datum: aktivnosti.datum,
            creatorId: aktivnosti.creatorId, // ✅ bitno za prava
            uradjen: korisnikAktivnosti.uradjen,
        })
        .from(aktivnosti)
        .leftJoin(
            korisnikAktivnosti,
            and(eq(korisnikAktivnosti.aktivnostId, aktivnosti.id), eq(korisnikAktivnosti.korisnikId, userId))
        );

    const rows = whereClause ? await q.where(whereClause) : await q;

    return NextResponse.json(
        rows.map((r) => {
            const owns = r.creatorId === userId;

            // pravila:
            // ADMIN: može sve
            // PCELAR/POLJOPRIVREDNIK: mogu samo svoje aktivnosti (creatorId==user) i samo ako tip odgovara njihovoj ulozi
            const canEdit = isAdmin || (owns && r.tip === role);
            const canDelete = isAdmin || (owns && r.tip === role);

            return {
                id: r.id,
                naziv: r.naziv,
                opis: r.opis ?? null,
                tip: r.tip,
                datum: r.datum ? r.datum.toISOString() : null,
                uradjen: r.uradjen === true,
                canEdit,
                canDelete,
            };
        })
    );
}

export async function POST(req: Request) {
    const auth = await requireAuth(["PCELAR", "POLJOPRIVREDNIK", "ADMIN"]);
    if (!auth.ok) return NextResponse.json({ message: auth.message }, { status: auth.status });

    const role = auth.user.role;
    const isAdmin = role === "ADMIN";

    const body = await req.json().catch(() => ({}));
    const naziv = String(body?.naziv ?? "").trim();
    const opis = body?.opis == null ? null : String(body.opis).trim();
    const datumStr = body?.datum == null ? null : String(body.datum).trim();

    if (!naziv) return NextResponse.json({ message: "Naziv je obavezan." }, { status: 400 });

    const datum = datumStr ? new Date(`${datumStr}T00:00:00`) : null;

    const tip = isAdmin ? "SEZONSKA" : role;

    const inserted = await db
        .insert(aktivnosti)
        .values({
            naziv,
            opis: opis === "" ? null : opis,
            datum,
            tip,
            creatorId: auth.user.id,
        })
        .returning({ id: aktivnosti.id });

    return NextResponse.json({ ok: true, id: inserted[0]?.id });
}
