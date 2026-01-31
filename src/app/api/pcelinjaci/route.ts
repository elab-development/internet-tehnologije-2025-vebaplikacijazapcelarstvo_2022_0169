import { NextResponse } from "next/server";
import { db } from "@/db";
import { pcelinjaci } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth";
import { mapPcelinjakRow } from "@/shared/types";


export async function GET() {
    try {
        // 1️⃣ Uzmi token iz cookie-ja
        const cookieStore = await cookies();
        const token = cookieStore.get(AUTH_COOKIE)?.value;
        if (!token) {
            return NextResponse.json({ error: "Niste prijavljeni" }, { status: 401 });
        }

        // 2️⃣ Verifikuj token
        const payload = await verifyAuthToken(token);
        if (!payload?.sub) {
            return NextResponse.json({ error: "Nevažeći token" }, { status: 401 });
        }

        const userId = payload.sub;

        // 3️⃣ Uzmi pčelinjake tog korisnika
        const rows = await db
            .select()
            .from(pcelinjaci)
            .where(eq(pcelinjaci.vlasnikId, userId));

        // 4️⃣ Mapiranje DB → Domain model
        //const result = rows.map(mapPcelinjakRow);

        return NextResponse.json(rows);
    } catch (err) {
        console.error("GET /api/pcelinjaci error:", err);
        return NextResponse.json({ error: "Greška na serveru" }, { status: 500 });
    }
}
