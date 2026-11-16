import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? ""; if (q.length < 2) return NextResponse.json([]);
  return NextResponse.json(await db.product.findMany({ where: { isArchived: false, name: { contains: q, mode: "insensitive" } }, select: { name: true, slug: true }, take: 5 }));
}
