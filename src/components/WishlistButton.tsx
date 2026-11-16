"use client";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/store";
export default function WishlistButton({ id }: { id: string }) {
  const { ids, toggle } = useWishlist(); const [m, setM] = useState(false); useEffect(() => setM(true), []); const on = m && ids.includes(id);
  return <button onClick={() => toggle(id)} aria-pressed={on} aria-label={on ? "Remove from wishlist" : "Add to wishlist"} className="text-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-primary"><Heart size={20} fill={on ? "currentColor" : "none"} /></button>;
}
