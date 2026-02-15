/**
 * @openapi
 * /api/profil/password:
 *   patch:
 *     summary: Promena šifre korisnika
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *               confirmPassword: { type: string }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Validacija nije prošla ili trenutna šifra nije tačna }
 *       401: { description: Neautorizovano }
 *       500: { description: Server greška pri promeni šifre }
 */


import { NextResponse } from "next/server";
import { db } from "@/db";
import { korisnici } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function PATCH(req: Request) {
    try {
        const auth = await requireAuth();
        if (!auth.ok) {
            return NextResponse.json({ message: auth.message }, { status: auth.status });
        }

        const body = await req.json().catch(() => ({}));
        const currentPassword = String(body?.currentPassword ?? "");
        const newPassword = String(body?.newPassword ?? "");
        const confirmPassword = String(body?.confirmPassword ?? "");

        if (!currentPassword) {
            return NextResponse.json({ message: "Unesi trenutnu šifru." }, { status: 400 });
        }
        if (newPassword.length < 8) {
            return NextResponse.json({ message: "Nova šifra mora imati bar 8 karaktera." }, { status: 400 });
        }
        if (newPassword !== confirmPassword) {
            return NextResponse.json({ message: "Nova šifra i potvrda se ne poklapaju." }, { status: 400 });
        }

        const [u] = await db
            .select({ sifra: korisnici.sifra })
            .from(korisnici)
            .where(eq(korisnici.id, auth.user.id));

        if (!u?.sifra) {
            return NextResponse.json({ message: "Nalog nema šifru." }, { status: 400 });
        }

        const ok = await bcrypt.compare(currentPassword, String(u.sifra));
        if (!ok) {
            return NextResponse.json({ message: "Trenutna šifra nije tačna." }, { status: 400 });
        }

        const newHash = await bcrypt.hash(newPassword, 10);

        await db
            .update(korisnici)
            .set({ sifra: newHash })
            .where(eq(korisnici.id, auth.user.id));

        return NextResponse.json({ ok: true });
    } catch (e: any) {

        console.error("PATCH /api/profil/password error:", e);
        return NextResponse.json(
            { message: "Server greška pri promeni šifre." },
            { status: 500 }
        );
    }
}
