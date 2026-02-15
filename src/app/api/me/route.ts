/**
 * @openapi
 * /api/me:
 *   get:
 *     summary: Vraća ulogu trenutno ulogovanog korisnika
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   type: string
 *                   nullable: true
 *                   enum: [ADMIN, PCELAR, POLJOPRIVREDNIK]
 */


import { NextResponse } from "next/server";
import { getRoleFromCookies } from "@/lib/auth";

export async function GET() {
  const role = await getRoleFromCookies();
  return NextResponse.json({ role });
}
