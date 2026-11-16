"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
export type CartItem = { productId: string; slug: string; name: string; price: number; qty: number };
type S = { items: CartItem[]; add: (i: Omit<CartItem, "qty">, q?: number) => void; setQty: (id: string, q: number) => void; remove: (id: string) => void; clear: () => void };
export const useCart = create<S>()(persist((set) => ({
  items: [],
  add: (i, q = 1) => set((s) => s.items.some((x) => x.productId === i.productId) ? { items: s.items.map((x) => x.productId === i.productId ? { ...x, qty: x.qty + q } : x) } : { items: [...s.items, { ...i, qty: q }] }),
  setQty: (id, q) => set((s) => ({ items: s.items.map((x) => x.productId === id ? { ...x, qty: Math.max(1, q) } : x) })),
  remove: (id) => set((s) => ({ items: s.items.filter((x) => x.productId !== id) })),
  clear: () => set({ items: [] }),
}), { name: "cart-v1" }));
