"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { allow } from "@/lib/ratelimit";
import { sendStoreEmail } from "@/lib/resend";

export type ContactFormState = {
  error?: string;
  success?: string;
};

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(2).max(120).refine((value) => !/[\r\n]/.test(value)),
  message: z.string().trim().min(10).max(3000),
  website: z.string().max(0),
});

export async function sendContactMessage(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please check your details and try again." };
  if (!(await allow("contact-email", 5, 3600))) {
    return { error: "Too many messages. Please try again later." };
  }

  const settings = await db.storeSettings.findUniqueOrThrow({ where: { id: 1 } });
  const recipient = settings.supportEmail || settings.email;
  if (!recipient) {
    return { error: "The store has not configured a customer support email yet." };
  }

  try {
    await sendStoreEmail({
      to: recipient,
      replyTo: parsed.data.email,
      subject: `Website contact: ${parsed.data.subject}`,
      text: [
        `From: ${parsed.data.name}`,
        `Reply email: ${parsed.data.email}`,
        "",
        parsed.data.message,
      ].join("\n"),
    });
  } catch (error) {
    console.error("Failed to send website contact message through Resend.", error);
    return { error: "We couldn't send your message right now. Please try again later." };
  }

  return { success: "Your message has been sent. The store will get back to you." };
}
