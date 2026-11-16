"use client";

import { useActionState } from "react";
import { sendContactMessage, type ContactFormState } from "@/app/actions-contact";

const initialState: ContactFormState = {};
const inputClass = "w-full border border-line px-3 py-2";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState);

  return (
    <form action={formAction} className="mt-8 max-w-2xl space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="contact-name">Your name</label>
        <input className={inputClass} id="contact-name" name="name" autoComplete="name" maxLength={80} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="contact-email">Email address</label>
        <input className={inputClass} id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="contact-subject">Subject</label>
        <input className={inputClass} id="contact-subject" name="subject" maxLength={120} required />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="contact-message">Message</label>
        <textarea className={inputClass} id="contact-message" name="message" rows={6} maxLength={3000} required />
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.error && <p role="alert" className="border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">{state.error}</p>}
      {state.success && <p role="status" className="border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">{state.success}</p>}
      <button type="submit" disabled={pending} className="bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}