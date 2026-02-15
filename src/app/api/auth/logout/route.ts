/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Odjava korisnika
 *     description: |
 *       Briše auth cookie i odjavljuje trenutno ulogovanog korisnika.
 *     responses:
 *       200:
 *         description: Uspešna odjava
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Greška na serveru
 */


import { NextResponse } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();


    cookieStore.set(AUTH_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }

}
