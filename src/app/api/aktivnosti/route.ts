import { NextResponse } from "next/server";
import { db } from "@/db";
import { aktivnosti, korisnikAktivnosti } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET() {
    const auth = await requireAuth(["PCELAR"]);
    if (!auth.ok) {
        return NextResponse.json(
            { message: auth.message },
            { status: auth.status }
        );
    }

    const korisnikId = auth.user.id;

    const rows = await db
        .select({
            id: aktivnosti.id,
            naziv: aktivnosti.naziv,
            opis: aktivnosti.opis,
            tip: aktivnosti.tip,
            datum: aktivnosti.datum,
            uradjen: korisnikAktivnosti.uradjen,
        })
        .from(aktivnosti)
        .leftJoin(
            korisnikAktivnosti,
            and(
                eq(korisnikAktivnosti.aktivnostId, aktivnosti.id),
                eq(korisnikAktivnosti.korisnikId, korisnikId)
            )
        )
        .where(
            or(
                eq(aktivnosti.tip, "SEZONSKA"),
                eq(aktivnosti.tip, "POLJOPRIVREDNIK"),
                and(
                    eq(aktivnosti.tip, "PCELAR"),
                    eq(aktivnosti.creatorId, korisnikId)
                )
            )
        );

    return NextResponse.json(
        rows.map((r) => ({
            ...r,
            uradjen: Boolean(r.uradjen),
        }))
    );
}
