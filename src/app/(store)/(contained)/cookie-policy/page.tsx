import type { Metadata } from "next";
import LegalDocument, { type LegalSection } from "@/components/LegalDocument";
import { getLegalSettings } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Cookie and browser storage policy",
  description: "How cookies and browser storage are used on this store.",
};
export const dynamic = "force-dynamic";

export default async function CookiePage() {
  const settings = await getLegalSettings();
  const sections: LegalSection[] = [
    {
      id: "overview",
      title: "What this policy covers",
      content: <p>Cookies are small browser files. This store also uses localStorage, which is browser storage but is not a cookie. The current app does not load analytics or advertising tags. Optional recently viewed product history is disabled unless you choose the personalization setting in <a className="text-primary underline underline-offset-4" href="#manage">Cookie settings</a>.</p>,
    },
    {
      id: "cookies",
      title: "Cookies used by the app",
      content: <ul className="list-disc space-y-2 pl-5">
        <li><strong>admin_session:</strong> an HTTP-only, same-site session cookie for signed-in administrators and staff. It expires after eight hours and is marked Secure in production. It is not used to track shoppers.</li>
        <li>The app does not currently set analytics or advertising cookies. A future analytics or advertising integration must remain off until the required choice has been obtained.</li>
      </ul>,
    },
    {
      id: "browser-storage",
      title: "Browser localStorage",
      content: <ul className="list-disc space-y-2 pl-5">
        <li><strong>cart-v1:</strong> product IDs, quantities and display details used to retain the shopper’s cart.</li>
        <li><strong>wishlist-v1:</strong> product IDs that the shopper deliberately saves to a wishlist.</li>
        <li><strong>recent-v1:</strong> up to eight recently viewed product IDs. This optional history is only recorded and used after personalization is enabled; disabling it clears the saved recent history.</li>
        <li><strong>wellness-cookie-preferences-v1:</strong> the selected categories, policy version and timestamp used to remember your choice. These preferences are stored locally, not in a cookie or customer account.</li>
      </ul>,
    },
    {
      id: "manage",
      title: "Manage or withdraw a choice",
      content: <><p>Use the Cookie settings control in the footer to accept all, reject non-essential choices or manage preferences. Necessary storage cannot be switched off in this panel because the admin session and cart depend on it. Personalization controls recently viewed products. Analytics and marketing integrations are not currently active.</p><p>You can also clear this site’s cookies and storage in your browser. Clearing them may empty your cart, wishlist and saved preferences. A later visit will ask for a new choice.</p><p>If your choice changes in another open tab, reload that tab to apply it.</p><p><a className="text-primary underline underline-offset-4" href="/privacy-policy">Read the privacy policy</a> for more about personal data and requests.</p></>,
    },
    {
      id: "third-party",
      title: "Third-party services",
      content: <p>Product images are served through Cloudinary, and the checkout can open WhatsApp after you choose to continue. Those providers may use their own technologies when you visit their services. Their handling is governed by their own notices. Hosting and database providers must be confirmed by the business owner before publication.</p>,
    },
    {
      id: "contact",
      title: "Contact",
      content: <p>For questions about cookies, browser storage or privacy, use the contact details in the <a className="text-primary underline underline-offset-4" href="/privacy-policy">privacy policy</a>.</p>,
    },
  ];

  return <LegalDocument title="Cookie and browser storage policy" summary="The store uses a small number of first-party browser features and currently has no analytics or advertising tags." sections={sections} settings={settings} />;
}
