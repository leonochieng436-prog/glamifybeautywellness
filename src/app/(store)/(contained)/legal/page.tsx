import Link from "next/link";

export const metadata = {
  title: "Legal information",
  description: "Store terms, privacy, cookie, returns, delivery and marketing policies.",
};

const policies = [
  ["Terms and conditions", "/terms-and-conditions", "How orders, payment choices and use of the store work."],
  ["Privacy policy", "/privacy-policy", "What personal information the store processes and how to make a request."],
  ["Cookie and browser storage policy", "/cookie-policy", "Cookies and the browser storage used by store features."],
  ["Returns and refunds", "/returns-and-refunds", "How to raise an order, delivery or product issue."],
  ["Shipping and delivery", "/shipping-policy", "Delivery arrangements, charges and order hand-off."],
  ["Marketing and newsletter", "/marketing-policy", "Optional newsletter consent and how to withdraw it."],
];

export default function LegalIndex() {
  return (
    <div className="py-10 sm:py-14">
      <p className="type-caption mb-3 font-semibold uppercase tracking-[0.16em] text-primary">Store policies</p>
      <h1 className="type-h1">Legal information</h1>
      <p className="type-body mt-4 max-w-3xl text-muted">
        These pages describe the current online store. Business-specific details that have not been supplied are marked for completion.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {policies.map(([title, href, description]) => (
          <Link key={href} href={href} className="border border-line p-5 transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline">
            <h2 className="type-h3">{title}</h2>
            <p className="mt-2 text-sm text-muted">{description}</p>
          </Link>
        ))}
      </div>
      <aside className="mt-8 border-l-4 border-primary bg-primary-soft p-5 text-sm">
        <h2 className="font-semibold">Before publishing</h2>
        <p className="mt-2">
          The business owner must complete legal identity, contact, policy version, effective date, delivery, returns and retention details in Admin &gt; Settings, confirm the applicable ODPC registration position, and arrange review by a qualified Kenyan advocate.
        </p>
      </aside>
    </div>
  );
}
