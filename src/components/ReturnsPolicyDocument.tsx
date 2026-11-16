import LegalDocument, { type LegalSection } from "@/components/LegalDocument";
import { getLegalSettings } from "@/lib/legal";

export default async function ReturnsPolicyDocument({ title }: { title: string }) {
  const settings = await getLegalSettings();
  const sections: LegalSection[] = [
    {
      id: "period",
      title: "Return request period",
      content: <p>Business policy period: {settings?.returnPeriod || "[BUSINESS OWNER: set a clear return-request period after confirming current Kenyan consumer law and product-specific requirements]"}. This is not a limit on rights that cannot lawfully be restricted. Contact the store as soon as possible if an order is incorrect, damaged, incomplete or otherwise not as agreed.</p>,
    },
    {
      id: "request",
      title: "How to raise an issue",
      content: <ol className="list-decimal space-y-2 pl-5">
        <li>Contact the store using the details in the <a className="text-primary underline underline-offset-4" href="/privacy-policy">privacy policy</a> or the WhatsApp number used to confirm your order.</li>
        <li>Include the order reference, a short description of the issue and the outcome you are requesting. Provide photographs only when reasonably needed to explain the issue.</li>
        <li>Wait for the store to confirm the next step before sending an item back. The store will explain any applicable collection or return arrangement.</li>
      </ol>,
    },
    {
      id: "condition",
      title: "Product condition and statutory rights",
      content: <p>Where practical, keep the product and packaging in the condition received while the issue is reviewed. This request does not remove any rights you have under applicable consumer law, including rights relating to goods that are faulty, misdescribed or not supplied as agreed. The owner must have Kenyan counsel check any product-specific return restrictions before publishing them; none are asserted here.</p>,
    },
    {
      id: "cancellation",
      title: "Order cancellation",
      content: <p>A checkout submission is pending until the store confirms availability and delivery by WhatsApp or another agreed channel. You may ask to cancel before confirmation. If the order has been confirmed, contact the store promptly; the store will assess the request under the order terms and applicable consumer law.</p>,
    },
    {
      id: "refunds",
      title: "Refunds and timing",
      content: <><p>Where a refund is due, the store will confirm the amount and method with you. Payment is arranged outside this website; the app does not connect to M-Pesa, a bank or a card processor and does not store payment credentials. The business’s intended processing timeline is: {settings?.refundTimeline || "[BUSINESS OWNER: set a realistic refund processing timeline after checking payment and legal requirements]"}.</p><p>Do not share an M-Pesa PIN, bank password, card security code or one-time password to receive a refund. The owner should verify the original payment and agree a safe refund method with the customer.</p></>,
    },
    {
      id: "contact",
      title: "Contact and review",
      content: <p>If you disagree with the proposed resolution, reply to the store and explain the issue. Mandatory consumer rights and available complaint routes are not limited by this policy. Ask a qualified Kenyan advocate to review this draft before publication.</p>,
    },
  ];

  return <LegalDocument title={title} summary="Contact the store promptly about an order problem. The owner must set the business-specific return and refund details before publication." sections={sections} settings={settings} />;
}
