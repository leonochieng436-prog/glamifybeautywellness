import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
const key = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
export const COOKIE = "admin_session";
export async function createSession(id: string, role: string) {
  const t = await new SignJWT({ id, role }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("8h").sign(key());
  (await cookies()).set(COOKIE, t, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 28800 });
}
export async function getSession() {
  const t = (await cookies()).get(COOKIE)?.value; if (!t) return null;
  try { return (await jwtVerify(t, key())).payload as { id: string; role: string }; } catch { return null; }
}
export async function requireAdmin() { const s = await getSession(); if (!s) redirect("/admin/login"); return s; }
