import type { Metadata } from "next";
import { db } from "@/lib/db";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Send a message to the store's customer support team.",
};
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await db.storeSettings.findUnique({
    where: { id: 1 },
    select: { supportEmail: true, email: true },
  });
  const contactEmail = settings?.supportEmail || settings?.email;

  return (
    <article className="mx-auto max-w-4xl py-10 sm:py-14">
      <p className="type-caption mb-3 font-semibold uppercase tracking-[0.16em] text-primary">Customer care</p>
      <h1 className="type-h1">Contact us</h1>
      <p className="type-body mt-4 max-w-3xl text-muted">
        Send us a message using the form below. We’ll reply to the email address you provide.
      </p>
      <ContactForm />
      {contactEmail && (
        <p className="mt-6 text-sm text-muted">
          Prefer email? Write to <a className="font-semibold text-primary underline underline-offset-4" href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      )}
    </article>
  );
}