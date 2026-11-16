import type { Metadata } from "next";
import NewsletterUnsubscribeForm from "@/components/NewsletterUnsubscribeForm";
import LegalDocument, { type LegalSection } from "@/components/LegalDocument";
import { getLegalSettings } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Marketing and newsletter policy",
  description: "How newsletter consent is collected and withdrawn.",
};
export const dynamic = "force-dynamic";

export default async function MarketingPolicyPage() {
  const settings = await getLegalSettings();
  const sections: LegalSection[] = [
    {
      id: "choice",
      title: "Optional newsletter choice",
      content: <p>Newsletter signup is optional and separate from checkout. The signup form requires an unticked checkbox confirming that you agree to receive marketing emails. The store records the email address, opt-in time and consent-version identifier. The app does not send newsletter campaigns. Resend is used only for transactional order notifications and messages sent through the contact form.</p>,
    },
    {
      id: "withdraw",
      title: "Withdraw consent",
      content: <><p>You can withdraw a signup below. The store will remove the matching newsletter record; the response does not reveal whether an address was subscribed.</p><NewsletterUnsubscribeForm /><p>You may also contact the privacy contact shown in the <a className="text-primary underline underline-offset-4" href="/privacy-policy">privacy policy</a>. Withdrawal does not affect order messages needed to handle a purchase.</p></>,
    },
    {
      id: "future",
      title: "If email campaigns are enabled later",
      content: <p>Before sending marketing messages, the business must configure a provider, document any data sharing and transfers, and provide a working unsubscribe mechanism in every marketing message. A previous order or an entered email address is not treated as newsletter consent.</p>,
    },
    {
      id: "contact",
      title: "Business contact",
      content: <p>For questions about marketing preferences, contact {settings?.privacyEmail || "[BUSINESS OWNER: provide privacy contact email]"}.</p>,
    },
  ];

  return <LegalDocument title="Marketing and newsletter policy" summary="Marketing is optional, separate from an order, and requires an explicit opt-in. Newsletter sending is not currently enabled in the app." sections={sections} settings={settings} />;
}
