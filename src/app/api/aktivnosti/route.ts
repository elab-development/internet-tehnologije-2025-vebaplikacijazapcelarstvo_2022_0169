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
