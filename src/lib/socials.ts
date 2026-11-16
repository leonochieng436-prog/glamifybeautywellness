export function isHttpsUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function getSocialStrings(value: unknown): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

export function getSocialUrls(value: unknown) {
  const socials = getSocialStrings(value);
  return {
    facebook: isHttpsUrl(socials.facebook) ? socials.facebook : "",
    instagram: isHttpsUrl(socials.instagram) ? socials.instagram : "",
  };
}
