"use client";
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { readCookiePreferences } from "@/lib/cookie-consent";
export const useWishlist = create<{ ids: string[]; toggle: (id: string) => void }>()(persist((set) => ({ ids: [], toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })) }), { name: "wishlist-v1" }));
const recentStorage = createJSONStorage(() => ({
  getItem: (name) => {
    if (name === "recent-v1" && !readCookiePreferences()?.personalization) return null;
    return window.localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (name !== "recent-v1" || readCookiePreferences()?.personalization) window.localStorage.setItem(name, value);
  },
  removeItem: (name) => window.localStorage.removeItem(name),
}) satisfies StateStorage);
export const useRecent = create<{ ids: string[]; view: (id: string) => void; clear: () => void }>()(persist((set) => ({
  ids: [],
  view: (id) => set((s) => ({ ids: [id, ...s.ids.filter((x) => x !== id)].slice(0, 8) })),
  clear: () => set({ ids: [] }),
}), { name: "recent-v1", storage: recentStorage }));
