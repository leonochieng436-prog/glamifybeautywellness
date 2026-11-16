import Link from "next/link";

export default function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="sticky top-16 z-10 -mx-4 -mt-6 mb-6 flex items-center justify-between gap-4 border-b border-line bg-slate-100 px-4 py-5 sm:-mx-6 sm:-mt-8 sm:px-6">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action && <Link href={action.href} className="inline-flex min-h-11 shrink-0 items-center bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">{action.label}</Link>}
    </div>
  );
}
