import type { Metadata } from "next";
import LegalDocument, { BusinessDetails, type LegalSection } from "@/components/LegalDocument";
import { getLegalSettings } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How the store collects and uses personal information.",
};
export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const settings = await getLegalSettings();
  const sections: LegalSection[] = [
    {
      id: "controller",
      title: "Who is responsible",
      content: <><p>The business below is the data controller for the store. Contact the privacy contact for questions or requests.</p><BusinessDetails settings={settings} /><p>The owner must confirm the controller identity, address and contact information before publication.</p></>,
    },
    {
      id: "information",
      title: "Information the store processes",
      content: <ul className="list-disc space-y-2 pl-5">
        <li>Order details: name, phone number, county, town, delivery address, optional instructions, selected payment method, items, prices, discount, order status, the accepted terms version and acceptance time.</li>
        <li>Contact messages: name, email address, subject and message submitted through the contact form.</li>
        <li>Customer details: name and phone number are associated with orders. The store does not currently offer customer accounts.</li>
        <li>First-party browser state: cart items, saved wishlist product IDs, optional recently viewed product IDs and your cookie preference categories.</li>
        <li>Newsletter details: email address and the time and version of your explicit marketing opt-in. The app does not currently send newsletter campaigns.</li>
        <li>Reviews: rating, review text and the customer/order link used to check a delivered purchase. Approved review text may appear publicly; the app does not display the reviewer’s full name.</li>
        <li>Admin details: administrator/staff email, name, password hash and role. An eight-hour signed session is held in an HTTP-only cookie.</li>
        <li>For rate limiting and abuse prevention, the app receives the client IP address from the x-forwarded-for request header and stores it with the rate-limit action, count and reset time. Hosting providers may also keep technical logs; the owner must identify those logs and providers.</li>
      </ul>,
    },
    {
      id: "purposes",
      title: "Why and on what basis",
      content: <ul className="list-disc space-y-2 pl-5">
        <li>To receive, verify and manage an order, contact you, arrange delivery and handle an order issue: steps requested before a contract and performance of the order.</li>
        <li>To respond to a message submitted through the contact form: your request for customer support.</li>
        <li>To maintain order, payment-status and business records: performance of the order and applicable legal obligations. The owner must set a retention schedule appropriate to actual obligations.</li>
        <li>To secure the admin area, limit abuse and protect the service, including rate-limiting requests by IP address: legitimate interests, subject to an assessment of those interests and your rights.</li>
        <li>To collect newsletter signups: your separate, affirmative consent. Marketing is not required to place an order.</li>
        <li>To receive and moderate a review: your request to submit it and the store’s management of product feedback. Publication happens only after moderation.</li>
      </ul>,
    },
    {
      id: "voluntary",
      title: "What is required",
      content: <p>Order contact and delivery details are needed to prepare and confirm an order. If required details are not provided, the store may be unable to process it. Delivery instructions are optional. Newsletter signup and a product review are optional and are not conditions of purchase. Do not send health details, payment credentials or another person’s personal information in a review or delivery note.</p>,
    },
    {
      id: "recipients",
      title: "Who receives information",
      content: <ul className="list-disc space-y-2 pl-5">
        <li>The store’s authorized staff access order and customer records to process orders.</li>
        <li>Resend processes order-notification and website-contact emails for the store when email delivery is configured.</li>
        <li>When you choose to continue to WhatsApp, checkout prepares a message containing the order reference, products, prices, your name and phone number, delivery location/address and preferred payment method. WhatsApp/Meta processes information under its own terms; the user must press send in WhatsApp.</li>
        <li>Cloudinary is used to upload and serve product images. The app’s upload flow is for product media, not customer payment details.</li>
        <li>The database and hosting providers are determined by deployment configuration and have not been verified for this policy. The owner must identify them and review their data-processing and security arrangements.</li>
        <li>The app has no integrated card processor, M-Pesa API, delivery-carrier tracking, analytics or advertising tag. Do not send full card, bank or M-Pesa credentials to the store.</li>
      </ul>,
    },
    {
      id: "transfers",
      title: "Storage location and transfers",
      content: <p>The production database and hosting region are not established in the application code. WhatsApp/Meta, Cloudinary and Resend may process data outside Kenya. Before launch, the owner must identify the actual hosting, database, media and email-processing regions, assess cross-border transfers under the Data Protection Act, 2019 and applicable regulations, and document the required safeguards. This policy must be updated if providers change.</p>,
    },
    {
      id: "retention",
      title: "How long information is kept",
      content: <><p>The application has no automated customer-data deletion schedule configured. The owner must set and apply retention periods that are necessary and lawful, including for accounting, order disputes, security records and marketing.</p><ul className="list-disc space-y-2 pl-5">
        <li>Order and customer records: {settings?.orderRetention || "[BUSINESS OWNER / ADVOCATE: set period and legal basis]"}.</li>
        <li>Newsletter signup: {settings?.newsletterRetention || "[BUSINESS OWNER: set period and withdrawal handling]"}.</li>
        <li>Reviews: {settings?.reviewRetention || "[BUSINESS OWNER: set moderation and removal schedule]"}.</li>
        <li>Security and rate-limit records: {settings?.securityRetention || "[BUSINESS OWNER: set period, including IP-based rate-limit records]"}.</li>
      </ul><p>The app does not automatically purge order, review or expired rate-limit records. Configuring a period here does not itself delete records; the owner must carry out the schedule or implement a verified deletion process. Do not publish until the periods and enforcement process are accurate.</p></>,
    },
    {
      id: "security",
      title: "Security",
      content: <p>The app applies access controls for the admin area, password hashing, signed expiring admin sessions, rate limits and encrypted transport when served over HTTPS. No website can guarantee absolute security. The owner must also secure deployment secrets, database access, backups, staff accounts and provider settings.</p>,
    },
    {
      id: "rights",
      title: "Your choices and data rights",
      content: <><p>You may contact the business to ask what personal information it holds, request access or correction, object to processing, withdraw consent, or request deletion/erasure or restriction where provided by applicable law. Some requests may be limited by legal duties or other lawful grounds; the business will assess each request and explain its response. Withdrawing newsletter consent does not affect an order or processing already lawfully completed.</p><p>Use the privacy contact shown above and include enough detail for the business to locate your information. Do not send passwords, PINs or identity documents unless the business explains a secure and necessary verification method. You may also contact the Office of the Data Protection Commissioner (ODPC) through its official website: <a className="text-primary underline underline-offset-4" href="https://www.odpc.go.ke/" target="_blank" rel="noreferrer">odpc.go.ke</a>.</p></>,
    },
    {
      id: "children",
      title: "Children and sensitive information",
      content: <p>The store is not designed to collect children’s information or health information. Do not submit a child’s or another person’s personal or health information through the store. If you believe such information was submitted, contact the privacy contact so the business can assess and respond under applicable law.</p>,
    },
    {
      id: "incidents",
      title: "Personal data incidents",
      content: <p>The business will investigate suspected personal data incidents, take reasonable containment and remediation steps, and notify the ODPC and affected people where and when required by applicable law. The owner must maintain an incident response process and provider contacts.</p>,
    },
    {
      id: "registration",
      title: "Registration and compliance review",
      content: <p>The owner must document whether the business is required to register as a data controller or processor under the Data Protection Act, 2019 and the Data Protection (Registration of Data Controllers and Data Processors) Regulations, 2021. Do not assume an exemption without checking the current thresholds, the business’s activities (including direct marketing) and ODPC guidance. This is an owner action, not a determination that the business is registered or exempt.</p>,
    },
    {
      id: "changes",
      title: "Changes and contact",
      content: <><p>Changes will be shown on this page with an updated version and effective date. For a privacy question, contact:</p><BusinessDetails settings={settings} /></>,
    },
  ];

  return <LegalDocument title="Privacy policy" summary="This notice describes the personal information handled by the current store implementation. It is not a substitute for completing the owner-specific details and legal review." sections={sections} settings={settings} />;
}
