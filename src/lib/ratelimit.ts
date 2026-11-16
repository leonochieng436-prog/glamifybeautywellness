import { headers } from "next/headers";
import { db } from "./db";
// Postgres-backed limiter: shared across all server instances.
export async function allow(name: string, max: number, windowSec: number) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "local"; const key = `${name}:${ip}`; const now = new Date();
  const resetAt = new Date(now.getTime() + windowSec * 1000);
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE
    SET
      "count" = CASE WHEN "RateLimit"."resetAt" < ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" < ${now} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
    WHERE "RateLimit"."resetAt" < ${now} OR "RateLimit"."count" < ${max}
    RETURNING "count"
  `;
  return rows.length > 0;
}
