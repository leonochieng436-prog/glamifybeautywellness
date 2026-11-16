"use client";
import Link from "next/link";
import { useActionState } from "react";
import { subscribe } from "@/app/actions2";
export default function Newsletter({ brandName }: { brandName: string }) {
  const [msg, act, pending] = useActionState(subscribe, "");
  return <form action={act} className="flex flex-wrap gap-2">
    <input name="email" type="email" required placeholder="Your email" aria-label={`Email address for ${brandName} updates`} className="min-h-11 min-w-0 flex-1 border border-line px-4 py-2" />
    <label className="flex w-full items-start gap-2 text-xs text-primary-light">
      <input name="marketingConsent" type="checkbox" required className="mt-0.5 accent-primary" />
      <span>I agree to receive optional newsletter emails. I can withdraw consent at any time. See the <Link className="underline underline-offset-2" href="/marketing-policy">marketing policy</Link> and <Link className="underline underline-offset-2" href="/privacy-policy">privacy policy</Link>.</span>
    </label>
    <button disabled={pending} className="min-h-11 bg-primary px-5 py-2 font-semibold text-white hover:bg-primary-dark">Subscribe</button>
    {msg && <p role="status" className="w-full text-sm text-primary-light">{msg}</p>}
  </form>;
}
