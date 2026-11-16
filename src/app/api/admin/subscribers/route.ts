import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const csv = (value: string) => {
  const safe = /^[=+\-@]/.test(value.trimStart()) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
};

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscribers = await db.newsletterSubscriber.findMany({
    where: { consentedAt: { not: null } },
    orderBy: { consentedAt: "desc" },
    select: { email: true, consentedAt: true, consentVersion: true },
  });
  const rows = [
    ["email", "consented_at", "consent_version"].map(csv).join(","),
    ...subscribers.map((subscriber) => [
      subscriber.email,
      subscriber.consentedAt?.toISOString() ?? "",
      subscriber.consentVersion ?? "",
    ].map(csv).join(",")),
  ];

  return new Response(`\uFEFF${rows.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="newsletter-subscribers.csv"',
      "Cache-Control": "no-store",
    },
  });
}
