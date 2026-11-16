import Link from "next/link";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes, InputHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export function Button({
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; loading?: boolean }) {
  const styles: Record<ButtonVariant, string> = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "border border-line bg-white text-ink hover:border-primary hover:text-primary",
    danger: "bg-red-700 text-white hover:bg-red-800",
    ghost: "text-ink hover:bg-slate-100",
  };
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${styles[variant]} ${className}`}
    >
      {loading ? "Saving..." : children}
    </button>
  );
}

const fieldClass = "min-h-11 w-full border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} min-h-28 ${props.className ?? ""}`} />;
}

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} type="checkbox" className={`h-4 w-4 accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${props.className ?? ""}`} />;
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">{label}</label>
      {children}
      {hint && <p id={hintId} className="text-xs text-muted">{hint}</p>}
      {error && <p id={errorId} role="alert" className="text-xs font-medium text-red-800">{error}</p>}
    </div>
  );
}

export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLElement>) {
  return <section {...props} className={`border border-line bg-white shadow-sm ${className}`}>{children}</section>;
}

export function StatCard({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-ink">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </Card>
  );
}

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-950",
  CONFIRMED: "bg-blue-100 text-blue-900",
  PROCESSING: "bg-blue-100 text-blue-900",
  DISPATCHED: "bg-slate-200 text-slate-900",
  DELIVERED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-red-100 text-red-900",
  PAID: "bg-emerald-100 text-emerald-900",
  UNPAID: "bg-amber-100 text-amber-950",
  ACTIVE: "bg-emerald-100 text-emerald-900",
  ARCHIVED: "bg-slate-200 text-slate-900",
  "IN STOCK": "bg-emerald-100 text-emerald-900",
  "LOW STOCK": "bg-amber-100 text-amber-950",
  "OUT OF STOCK": "bg-red-100 text-red-900",
};

export function StatusPill({ status, className = "" }: { status: string; className?: string }) {
  const label = status.replaceAll("_", " ");
  return (
    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold ${statusStyles[label] ?? "bg-slate-100 text-slate-800"} ${className}`}>
      {label}
    </span>
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
}: {
  columns: { key: string; header: string; render: (row: T) => ReactNode; className?: string }[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
}) {
  if (!rows.length) return empty ?? <EmptyState title="Nothing here yet" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-muted">
          <tr>{columns.map((column) => <th key={column.key} scope="col" className={`px-4 py-3 ${column.className ?? ""}`}>{column.header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-slate-50">
              {columns.map((column) => <td key={column.key} className={`px-4 py-3 align-middle ${column.className ?? ""}`}>{column.render(row)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="border border-dashed border-line bg-white px-6 py-10 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{description}</p>}
      {action && <Link href={action.href} className="mt-4 inline-flex min-h-11 items-center bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">{action.label}</Link>}
    </div>
  );
}

export { default as PageHeader } from "../PageHeader";

export function Pagination({
  previous,
  next,
  page,
}: {
  previous?: string;
  next?: string;
  page: number;
}) {
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between border-t border-line px-4 py-3">
      {previous ? <Link href={previous} className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-primary hover:bg-blue-50">Previous</Link> : <span />}
      <span className="text-sm tabular-nums text-muted">Page {page}</span>
      {next ? <Link href={next} className="inline-flex min-h-11 items-center px-3 text-sm font-medium text-primary hover:bg-blue-50">Next</Link> : <span />}
    </nav>
  );
}

export { default as Tabs } from "../Tabs";

export function Toast({ message, tone = "success" }: { message: string; tone?: "success" | "error" }) {
  return (
    <div role={tone === "error" ? "alert" : "status"} aria-live={tone === "error" ? "assertive" : "polite"} className={`border px-4 py-3 text-sm ${tone === "error" ? "border-red-300 bg-red-50 text-red-900" : "border-emerald-300 bg-emerald-50 text-emerald-900"}`}>
      {message}
    </div>
  );
}
