"use client";
import { useActionState } from "react";
import { login } from "@/app/admin/actions";
export default function Login() {
  const [err, act, pending] = useActionState(login, "");
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <form action={act} className="w-full max-w-md space-y-5 border border-line bg-white p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Beauty & Wellness</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage your store.</p>
        </div>
        <label className="block space-y-1.5 text-sm font-medium" htmlFor="admin-email">
          Email
          <input id="admin-email" name="email" type="email" autoComplete="username" required className="min-h-11 w-full border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </label>
        <label className="block space-y-1.5 text-sm font-medium" htmlFor="admin-password">
          Password
          <input id="admin-password" name="password" type="password" autoComplete="current-password" required className="min-h-11 w-full border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </label>
        {err && <p role="alert" className="border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">{err}</p>}
        <button type="submit" disabled={pending} className="min-h-11 w-full bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
