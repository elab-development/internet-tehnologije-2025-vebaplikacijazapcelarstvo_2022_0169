import { NextResponse } from "next/server";
import { db } from "@/db";
import { korisnikAktivnosti } from "@/db/schema";

import { requireAuth } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const auth = await requireAuth(["PCELAR", "ADMIN", "POLJOPRIVREDNIK"]);
    if (!auth.ok) return new NextResponse(auth.message, { status: auth.status });

    const user = auth.user;

    const body = await req.json();
    if (typeof body.uradjen !== "boolean") {
        return new NextResponse("Body mora biti { uradjen: boolean }", { status: 400 });
    }

    const uradjen = body.uradjen as boolean;

    await db
        .insert(korisnikAktivnosti)
        .values({
            korisnikId: user.id,
            aktivnostId: params.id,
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

    return NextResponse.json({ ok: true });
}
