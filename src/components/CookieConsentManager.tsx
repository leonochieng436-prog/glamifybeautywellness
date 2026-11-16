"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  COOKIE_PREFERENCES_EVENT,
  COOKIE_PREFERENCES_KEY,
  COOKIE_PREFERENCES_VERSION,
  readCookiePreferences,
  type CookiePreferences,
} from "@/lib/cookie-consent";
import { useRecent } from "@/lib/store";

const emptyPreferences = () => ({
  personalization: false,
  analytics: false,
  marketing: false,
});

export default function CookieConsentManager() {
  const [initialized, setInitialized] = useState(false);
  const [hasChoice, setHasChoice] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [draft, setDraft] = useState(emptyPreferences);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = readCookiePreferences();
    setHasChoice(Boolean(saved));
    setDraft(saved ? {
      personalization: saved.personalization,
      analytics: saved.analytics,
      marketing: saved.marketing,
    } : emptyPreferences());
    setInitialized(true);
  }, []);

  function save(next: ReturnType<typeof emptyPreferences>) {
    const preferences: CookiePreferences = {
      ...next,
      version: COOKIE_PREFERENCES_VERSION,
      updatedAt: new Date().toISOString(),
      essential: true,
    };
    try {
      window.localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
      window.dispatchEvent(new CustomEvent(COOKIE_PREFERENCES_EVENT, { detail: preferences }));
      if (!preferences.personalization) {
        window.localStorage.removeItem("recent-v1");
        useRecent.getState().clear();
      }
      setDraft(next);
      setHasChoice(true);
      setShowSettings(false);
      setError("");
    } catch {
      setError("Your choice could not be saved in this browser. Check its storage settings and try again.");
    }
  }

  function openSettings() {
    const saved = readCookiePreferences();
    setDraft(saved ? {
      personalization: saved.personalization,
      analytics: saved.analytics,
      marketing: saved.marketing,
    } : emptyPreferences());
    setShowSettings(true);
    setError("");
  }

  const visible = initialized && (!hasChoice || showSettings);

  return (
    <>
      <button type="button" onClick={openSettings} className="flex min-h-11 items-center py-1 text-left text-primary-light underline underline-offset-4 hover:text-white">
        Cookie settings
      </button>
      {visible && (
        <section
          data-cookie-consent
          aria-labelledby="cookie-settings-title"
          className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-primary bg-paper p-4 text-ink shadow-2xl sm:p-6"
        >
          <div className="mx-auto max-w-6xl">
            <h2 id="cookie-settings-title" className="type-h3">Cookie and browser-storage choices</h2>
            <p className="mt-2 max-w-4xl text-sm text-muted">
              The cart and saved wishlist use first-party browser storage. Recently viewed products are optional and stay off until enabled. No analytics or advertising tags currently run. Read our{" "}
              <Link className="text-primary underline underline-offset-4" href="/cookie-policy">cookie policy</Link>.
            </p>

            {showSettings ? (
              <fieldset className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <legend className="sr-only">Optional browser-storage preferences</legend>
                <label className="flex items-start gap-3 border border-line p-3">
                  <input type="checkbox" checked disabled className="mt-1 accent-primary" />
                  <span><strong className="block">Necessary</strong><span className="text-muted">Always on for the admin session, cart and remembering this choice.</span></span>
                </label>
                <label className="flex items-start gap-3 border border-line p-3">
                  <input type="checkbox" checked={draft.personalization} onChange={(e) => setDraft((old) => ({ ...old, personalization: e.target.checked }))} className="mt-1 accent-primary" />
                  <span><strong className="block">Personalization</strong><span className="text-muted">Recently viewed products, stored on this device.</span></span>
                </label>
                <label className="flex items-start gap-3 border border-line p-3">
                  <input type="checkbox" checked={draft.analytics} onChange={(e) => setDraft((old) => ({ ...old, analytics: e.target.checked }))} className="mt-1 accent-primary" />
                  <span><strong className="block">Analytics</strong><span className="text-muted">No analytics provider is currently active.</span></span>
                </label>
                <label className="flex items-start gap-3 border border-line p-3">
                  <input type="checkbox" checked={draft.marketing} onChange={(e) => setDraft((old) => ({ ...old, marketing: e.target.checked }))} className="mt-1 accent-primary" />
                  <span><strong className="block">Advertising</strong><span className="text-muted">No advertising tags are currently active.</span></span>
                </label>
              </fieldset>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              {showSettings ? (
                <>
                  <button type="button" onClick={() => save(draft)} className="bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Save preferences</button>
                  <button type="button" onClick={() => save({ personalization: true, analytics: true, marketing: true })} className="border border-line px-4 py-2 text-sm font-semibold hover:border-primary">Accept all</button>
                  <button type="button" onClick={() => save(emptyPreferences())} className="border border-line px-4 py-2 text-sm font-semibold hover:border-primary">Reject non-essential</button>
                  {hasChoice && <button type="button" onClick={() => setShowSettings(false)} className="px-4 py-2 text-sm font-semibold underline underline-offset-4">Close</button>}
                </>
              ) : (
                <>
                  <button type="button" onClick={() => save({ personalization: true, analytics: true, marketing: true })} className="bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Accept all</button>
                  <button type="button" onClick={() => save(emptyPreferences())} className="border border-line px-4 py-2 text-sm font-semibold hover:border-primary">Reject non-essential</button>
                  <button type="button" onClick={openSettings} className="border border-line px-4 py-2 text-sm font-semibold hover:border-primary">Manage preferences</button>
                </>
              )}
            </div>
            {error && <p role="alert" className="mt-3 text-sm font-medium text-primary-dark">{error}</p>}
          </div>
        </section>
      )}
    </>
  );
}
