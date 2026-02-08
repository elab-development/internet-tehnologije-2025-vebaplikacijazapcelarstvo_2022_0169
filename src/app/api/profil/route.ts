import { NextResponse } from "next/server";
import { db } from "@/db";
import { korisnici } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, signAuthToken, AUTH_COOKIE, cookieOpts } from "@/lib/auth";

export async function GET() {
    const auth = await requireAuth();
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }

    const [u] = await db
        .select({
            id: korisnici.id,
            ime: korisnici.ime,
            prezime: korisnici.prezime,
            email: korisnici.email,
            uloga: korisnici.uloga,
            createdAt: korisnici.createdAt,
        })
        .from(korisnici)
        .where(eq(korisnici.id, auth.user.id));

    if (!u) {
        return NextResponse.json({ message: "Korisnik nije nađen." }, { status: 404 });
    }

    return NextResponse.json({
        user: {
            id: u.id,
            ime: u.ime ?? "",
            prezime: u.prezime ?? "",
            email: u.email,
            uloga: String(u.uloga ?? auth.user.role).toUpperCase(),
            createdAt: u.createdAt ? u.createdAt.toISOString() : null,
        },
    });
}

export async function PUT(req: Request) {
    const auth = await requireAuth();
    if (!auth.ok) {
        return NextResponse.json({ message: auth.message }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const ime = String(body?.ime ?? "").trim();
    const prezime = String(body?.prezime ?? "").trim();
    const email = String(body?.email ?? "").trim();

    if (!ime) return NextResponse.json({ message: "Ime je obavezno." }, { status: 400 });
    if (!prezime) return NextResponse.json({ message: "Prezime je obavezno." }, { status: 400 });
    if (!email || !email.includes("@")) {
        return NextResponse.json({ message: "Email nije validan." }, { status: 400 });
    }

    const existing = await db
        .select({ id: korisnici.id })
        .from(korisnici)
        .where(eq(korisnici.email, email));

    if (existing.length > 0 && existing[0].id !== auth.user.id) {
        return NextResponse.json({ message: "Email je već zauzet." }, { status: 400 });
    }

    await db
        .update(korisnici)
        .set({ ime, prezime, email })
        .where(eq(korisnici.id, auth.user.id));

    const newToken = signAuthToken({
        sub: auth.user.id,
        email,
        name: `${ime} ${prezime}`.trim(),
        role: auth.user.role,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(AUTH_COOKIE, newToken, cookieOpts());
    return res;
}
