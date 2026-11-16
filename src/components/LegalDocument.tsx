import Link from "next/link";
import type { ReactNode } from "react";
import {
  LEGAL_CONTENT_UPDATED,
  LEGAL_POLICY_VERSION_FALLBACK,
  type LegalSettings,
} from "@/lib/legal";

export type LegalSection = { id: string; title: string; content: ReactNode };

export function BusinessDetails({ settings }: { settings: LegalSettings | null }) {
  const entries = [
    ["Legal business name", settings?.legalName],
    ["Trading name", settings?.tradingName],
    ["Registration details", settings?.registrationDetails],
    ["Physical address", settings?.physicalAddress],
    ["Customer support", settings?.supportEmail],
    ["Privacy requests", settings?.privacyEmail],
  ] as const;

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {entries.map(([label, value]) => (
        <div key={label} className="border border-line p-4">
          <dt className="text-sm font-semibold">{label}</dt>
          <dd className="mt-1 break-words text-sm text-muted">
            {value || `[BUSINESS OWNER: provide ${label.toLowerCase()}]`}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function LegalDocument({
  title,
  summary,
  sections,
  settings,
}: {
  title: string;
  summary: string;
  sections: LegalSection[];
  settings: LegalSettings | null;
}) {
  const version = settings?.legalPolicyVersion || LEGAL_POLICY_VERSION_FALLBACK;
  const effective = settings?.legalEffectiveDate
    ? settings.legalEffectiveDate.toLocaleDateString("en-KE", { dateStyle: "long", timeZone: "UTC" })
    : "Not configured — set an effective date in Admin > Settings";
  const incomplete = !settings?.legalName || !settings?.physicalAddress || !settings?.supportEmail || !settings?.privacyEmail || !settings?.legalPolicyVersion || !settings?.legalEffectiveDate;

  return (
    <div className="legal-page py-10 sm:py-14">
      <Link href="/legal" className="no-print text-sm font-semibold text-primary underline underline-offset-4">
        Legal information
      </Link>
      <div className="mt-5 border-b border-line pb-8">
        <p className="type-caption mb-3 font-semibold uppercase tracking-[0.16em] text-primary">Store policies</p>
        <h1 className="type-h1">{title}</h1>
        <p className="type-body mt-4 max-w-3xl text-muted">{summary}</p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <span>Version: {version}</span>
          <span>Effective: {effective}</span>
          <span>Content updated: {LEGAL_CONTENT_UPDATED}</span>
        </div>
      </div>

      {incomplete && (
        <aside className="my-6 border-l-4 border-primary bg-primary-soft p-4 text-sm" aria-label="Policy completion notice">
          <strong>Business details need completion.</strong> This policy contains clearly marked placeholders.
          Complete Admin &gt; Settings and have the wording reviewed by a qualified Kenyan advocate before relying on it.
        </aside>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav className="no-print h-fit border border-line p-5 lg:sticky lg:top-6" aria-label="On this page">
          <h2 className="mb-3 font-semibold">On this page</h2>
          <ol className="space-y-2 text-sm">
            {sections.map((section) => (
              <li key={section.id}>
                <a className="text-muted underline decoration-line underline-offset-4 hover:text-primary" href={`#${section.id}`}>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="min-w-0">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-8 border-b border-line py-7 first:pt-0">
              <h2 className="type-h3 mb-4">{section.title}</h2>
              <div className="space-y-4 text-sm leading-7 text-ink">{section.content}</div>
            </section>
          ))}
          <div className="no-print mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link className="text-primary underline underline-offset-4" href="/privacy-policy">Privacy policy</Link>
            <Link className="text-primary underline underline-offset-4" href="/cookie-policy">Cookie policy</Link>
            <Link className="text-primary underline underline-offset-4" href="/marketing-policy">Marketing policy</Link>
          </div>
        </article>
      </div>
    </div>
  );
}
