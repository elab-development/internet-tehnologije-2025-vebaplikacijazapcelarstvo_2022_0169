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
