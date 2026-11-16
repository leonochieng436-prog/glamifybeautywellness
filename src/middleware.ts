import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();
  const t = req.cookies.get("admin_session")?.value;
  try { await jwtVerify(t ?? "", new TextEncoder().encode(process.env.AUTH_SECRET ?? "")); return NextResponse.next(); }
  catch { return NextResponse.redirect(new URL("/admin/login", req.url)); }
}
export const config = { matcher: ["/admin/:path*"] };
