import { NextResponse } from "next/server";
import { and, eq, isNull, or, gte, lt } from "drizzle-orm";

import { db } from "@/db";
import { aktivnosti, korisnici, korisnikAktivnosti } from "@/db/schema";
import { sendMail } from "@/lib/mail";

function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function addDays(d: Date, days: number) {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
}

function endExclusiveOfDay(d: Date) {

    return startOfDay(addDays(d, 1));
}

export async function GET(request: Request) {

    const secret = process.env.CRON_SECRET;
    if (secret) {
        const hdr = request.headers.get("x-cron-secret");
        if (hdr !== secret) {
            return new NextResponse("Forbidden", { status: 403 });
        }
    }


    const day = startOfDay(addDays(new Date(), 2));
    const dayEnd = endExclusiveOfDay(day);

    const pcelari = await db
        .select({ id: korisnici.id, email: korisnici.email, ime: korisnici.ime })
        .from(korisnici)
        .where(eq(korisnici.uloga, "pcelar"));

    let sent = 0;

    for (const u of pcelari) {
        const due = await db
            .select({
                aktivnostId: aktivnosti.id,
                naziv: aktivnosti.naziv,
                datum: aktivnosti.datum,
                tip: aktivnosti.tip,
                uradjen: korisnikAktivnosti.uradjen,
                reminderSentAt: korisnikAktivnosti.reminderSentAt,
            })
            .from(aktivnosti)
            .leftJoin(
                korisnikAktivnosti,
                and(
                    eq(korisnikAktivnosti.korisnikId, u.id),
                    eq(korisnikAktivnosti.aktivnostId, aktivnosti.id)
                )
            )
            .where(
                and(

                    or(
                        eq(aktivnosti.tip, "SEZONSKA"),
                        eq(aktivnosti.tip, "POLJOPRIVREDNIK"),
                        and(eq(aktivnosti.tip, "PCELAR"), eq(aktivnosti.creatorId, u.id))
                    ),

                    gte(aktivnosti.datum, day),
                    lt(aktivnosti.datum, dayEnd),

                    or(isNull(korisnikAktivnosti.uradjen), eq(korisnikAktivnosti.uradjen, false)),

                    isNull(korisnikAktivnosti.reminderSentAt)
                )
            );

        for (const a of due) {
            await sendMail({
                to: u.email,
                subject: "🐝 Podsetnik: aktivnost za 2 dana",
                text: `Zdravo ${u.ime},

Podsetnik: za 2 dana imaš aktivnost:
• ${a.naziv}
Datum: ${a.datum ? a.datum.toISOString().slice(0, 10) : "-"}

Pozdrav!`,
            });


            const now = new Date();

            await db
                .insert(korisnikAktivnosti)
                .values({
                    korisnikId: u.id,
                    aktivnostId: a.aktivnostId,
                    reminderSentAt: now,
                })
                .onConflictDoUpdate({
                    target: [korisnikAktivnosti.korisnikId, korisnikAktivnosti.aktivnostId],
                    set: { reminderSentAt: now },
                });

            sent++;
        }
    }

    return NextResponse.json({ ok: true, sent });
}
