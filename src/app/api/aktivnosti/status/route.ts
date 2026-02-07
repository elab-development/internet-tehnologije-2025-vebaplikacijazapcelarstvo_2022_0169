import { NextResponse } from "next/server";
import { db } from "@/db";
import { korisnikAktivnosti } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
    const auth = await requireAuth(["PCELAR"]);
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }

    const { aktivnostId, uradjen } = await req.json();

    if (typeof uradjen !== "boolean") {
        return NextResponse.json({ message: "Neispravan status" }, { status: 400 });
    }

    await db
        .insert(korisnikAktivnosti)
        .values({
            korisnikId: auth.user.id,
            aktivnostId,
            uradjen,
            uradjenAt: uradjen ? new Date() : null,
        })
        .onConflictDoUpdate({
            target: [
                korisnikAktivnosti.korisnikId,
                korisnikAktivnosti.aktivnostId,
            ],
            set: {
                uradjen,
                uradjenAt: uradjen ? new Date() : null,
            },
        });

    return NextResponse.json({ ok: true });
}
