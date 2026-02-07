import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMail(opts: {
    to: string;
    subject: string;
    text: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY nije postavljen");
    }

    await resend.emails.send({
        from: process.env.MAIL_FROM || "Pčelarstvo <onboarding@resend.dev>",
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
    });
}
