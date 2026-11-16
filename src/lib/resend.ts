import { Resend } from "resend";

type StoreEmail = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

export async function sendStoreEmail({ to, subject, text, replyTo }: StoreEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  if (!from) throw new Error("RESEND_FROM_EMAIL is not configured.");

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
  if (error) throw new Error(`Resend rejected the email: ${error.message}`);
  return data;
}
