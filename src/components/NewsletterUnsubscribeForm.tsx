"use client";

import { useActionState } from "react";
import { withdrawNewsletterConsent } from "@/app/actions2";

export default function NewsletterUnsubscribeForm() {
  const [message, action, pending] = useActionState(withdrawNewsletterConsent, "");
  return (
    <form action={action} className="my-4 flex max-w-xl flex-wrap gap-2 border border-line p-4">
      <label htmlFor="unsubscribe-email" className="w-full font-semibold">Email address</label>
      <input id="unsubscribe-email" name="email" type="email" required className="min-w-0 flex-1 border border-line px-3 py-2" />
      <button disabled={pending} className="bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-dark">
        {pending ? "Removing…" : "Withdraw newsletter consent"}
      </button>
      {message && <p role="status" className="w-full text-sm text-muted">{message}</p>}
    </form>
  );
}
