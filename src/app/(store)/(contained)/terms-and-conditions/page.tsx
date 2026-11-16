import type { Metadata } from "next";
import LegalDocument, { BusinessDetails, type LegalSection } from "@/components/LegalDocument";
import { getLegalSettings } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "Terms for using the store and placing an order.",
};
export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const settings = await getLegalSettings();
  const sections: LegalSection[] = [
    {
      id: "seller",
      title: "Seller and contact details",
      content: <><p>The seller is the business identified below. The store is not ready for publication until the owner completes the missing details.</p><BusinessDetails settings={settings} /></>,
    },
    {
      id: "scope",
      title: "Using this store",
      content: <p>These terms apply when you browse the store or submit an order. By submitting an order, you confirm that the information you provide is accurate and that you are authorized to use the chosen contact and delivery details. The store currently has no customer account feature.</p>,
    },
    {
      id: "products",
      title: "Products, prices and availability",
      content: <p>Prices are shown in Kenyan shillings (KES). Product availability and the final order details are checked by the store before acceptance. Product information and images are provided to help identify items; they are not medical advice and do not promise a particular health or beauty outcome. Read the product packaging and directions and seek qualified advice where appropriate.</p>,
    },
    {
      id: "orders",
      title: "Submitting and accepting an order",
      content: <p>Submitting checkout creates a pending order record and opens a pre-filled WhatsApp message. You must choose whether to send that message. The store has not accepted an order until it confirms availability and delivery arrangements with you through WhatsApp or another agreed channel. The store may contact you to correct details or explain that an item is unavailable. You may ask to cancel before confirmation; after confirmation, contact the store promptly and the cancellation and return rules below apply.</p>,
    },
    {
      id: "payment",
      title: "Payment",
      content: <p>The checkout records your preferred method (M-Pesa, cash on delivery or bank transfer) but does not process a payment. Payment instructions and any amount due must be confirmed by the store. Never share an M-Pesa PIN, bank password, card security code or one-time password in the checkout or WhatsApp message. A payment is marked paid by the store after its own verification.</p>,
    },
    {
      id: "delivery",
      title: "Delivery, returns and consumer rights",
      content: <p>Delivery coverage, charges and timing must be agreed before the order is accepted; the checkout currently does not calculate a delivery fee or provide shipment tracking. See the <a className="text-primary underline underline-offset-4" href="/shipping-policy">shipping policy</a> and <a className="text-primary underline underline-offset-4" href="/returns-and-refunds">returns and refunds policy</a>. Nothing in these terms limits any consumer rights that cannot lawfully be excluded.</p>,
    },
    {
      id: "reviews",
      title: "Reviews and user submissions",
      content: <p>Reviews may be submitted by customers whose delivered order is verified. A review is not published until approved by the store. Do not include sensitive personal information, health information or information about another person in a review. The store may decline or remove content that is unlawful, abusive, misleading or unrelated to the product.</p>,
    },
    {
      id: "availability",
      title: "Website availability and changes",
      content: <p>The store may update product information, prices, these terms or site features. A change to a submitted order will be communicated before acceptance. A new policy version and effective date will be shown above; the version accepted with an order is recorded with that order.</p>,
    },
    {
      id: "law",
      title: "Applicable law and complaints",
      content: <p>These terms are intended to be governed by the laws of Kenya, subject to mandatory consumer protections and the jurisdiction of competent Kenyan courts. Please contact the seller first to try to resolve an issue. This draft must be reviewed against the Consumer Protection Act, 2012, Sale of Goods Act and other applicable Kenyan law before use.</p>,
    },
    {
      id: "contact",
      title: "Contact",
      content: <BusinessDetails settings={settings} />,
    },
  ];

  return <LegalDocument title="Terms and conditions" summary="Please read these terms before placing an order. Checkout requires acceptance, and the accepted policy version and time are recorded with the order." sections={sections} settings={settings} />;
}
