import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 20);
  const ps = await db.product.findMany({ where: { id: { in: ids }, isArchived: false }, include: { inventory: true, images: { orderBy: { position: "asc" }, take: 1 } } });
  return NextResponse.json(ids.map((i) => ps.find((p) => p.id === i)).filter(Boolean));
}
