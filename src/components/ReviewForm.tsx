"use client";
import { useActionState } from "react";
import { submitReview } from "@/app/actions2";
export default function ReviewForm({ productId }: { productId: string }) {
  const [msg, act, pending] = useActionState(submitReview.bind(null, productId), ""); const inp = "w-full border border-line px-3 py-2";
  return <form action={act} className="max-w-md space-y-2"><h3 className="font-display text-xl font-semibold">Write a review</h3><input name="phone" required placeholder="Phone number used for your order" className={inp} />
    <select name="rating" className={inp}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}</select><textarea name="body" required placeholder="Your review" className={inp} />
    <button disabled={pending} className="bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Submit review</button>{msg && <p role="status" className="text-sm text-muted">{msg}</p>}</form>;
}
