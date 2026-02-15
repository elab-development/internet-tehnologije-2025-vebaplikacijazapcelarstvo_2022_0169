/**
 * @openapi
 * /api/test-mail:
 *   get:
 *     summary: Slanje test emaila
 *     description: Šalje test email kako bi se proverilo da li mail servis radi.
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */


import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

export async function GET() {
    await sendMail({
        to: "akibrajic@gmail.com",
        subject: "Test mejl 🐝",
        text: "Ako si dobio ovaj mejl, slanje radi.",
    });

    return NextResponse.json({ ok: true });
}
