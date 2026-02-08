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
