export const COOKIE_PREFERENCES_KEY = "wellness-cookie-preferences-v1";
export const COOKIE_PREFERENCES_EVENT = "wellness-cookie-preferences-change";
export const COOKIE_PREFERENCES_VERSION = "1";

export type CookiePreferences = {
  version: string;
  updatedAt: string;
  essential: true;
  personalization: boolean;
  analytics: boolean;
  marketing: boolean;
};

export function readCookiePreferences(): CookiePreferences | null {
  try {
    const raw = window.localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== "object" ||
      value === null ||
      !("version" in value) ||
      !("updatedAt" in value) ||
      !("essential" in value) ||
      !("personalization" in value) ||
      !("analytics" in value) ||
      !("marketing" in value) ||
      value.version !== COOKIE_PREFERENCES_VERSION ||
      typeof value.updatedAt !== "string" ||
      value.essential !== true ||
      typeof value.personalization !== "boolean" ||
      typeof value.analytics !== "boolean" ||
      typeof value.marketing !== "boolean"
    ) return null;
    return {
      version: COOKIE_PREFERENCES_VERSION,
      updatedAt: value.updatedAt,
      essential: true,
      personalization: value.personalization,
      analytics: value.analytics,
      marketing: value.marketing,
    };
  } catch {
    return null;
  }
}
