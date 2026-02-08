import { Resend } from "resend";

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY nije postavljen");
  }
  return new Resend(key);
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
}) {
  const resend = getResendClient();

  await resend.emails.send({
    from: process.env.MAIL_FROM || "Pčelarstvo <onboarding@resend.dev>",
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
  });
}
