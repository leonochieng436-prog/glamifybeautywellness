"use client";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-start justify-center px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Admin workspace</p>
      <h1 className="mt-2 text-2xl font-bold">This page could not be loaded</h1>
      <p className="mt-2 text-sm text-muted">Try again. If the problem continues, check your connection and store configuration.</p>
      <button type="button" onClick={reset} className="mt-6 min-h-11 bg-primary px-4 font-semibold text-white hover:bg-primary-dark">Try again</button>
    </section>
  );
}
