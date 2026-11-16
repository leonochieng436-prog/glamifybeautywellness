"use client";
import { useEffect } from "react";
import { useRecent } from "@/lib/store";
import { COOKIE_PREFERENCES_EVENT, readCookiePreferences } from "@/lib/cookie-consent";

export default function RecentTracker({ id }: { id: string }) {
  const view = useRecent((s) => s.view);
  useEffect(() => {
    const record = () => {
      if (readCookiePreferences()?.personalization) view(id);
    };
    record();
    window.addEventListener(COOKIE_PREFERENCES_EVENT, record);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, record);
  }, [id, view]);
  return null;
}
