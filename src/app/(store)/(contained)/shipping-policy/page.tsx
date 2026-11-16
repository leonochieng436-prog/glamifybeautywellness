import type { Metadata } from "next";
import LegalDocument, { type LegalSection } from "@/components/LegalDocument";
import { getLegalSettings } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Shipping and delivery",
  description: "How the store confirms delivery areas, charges and timing.",
};
export const dynamic = "force-dynamic";

export default async function ShippingPage() {
  const settings = await getLegalSettings();
  const sections: LegalSection[] = [
    {
      id: "areas",
      title: "Delivery area",
      content: <p>Configured delivery areas: {settings?.deliveryAreas || "[BUSINESS OWNER: list counties/towns served and any exclusions]"} . An address entered at checkout is a request only; the store must confirm that it can deliver there before accepting the order.</p>,
    },
    {
      id: "charges",
      title: "Delivery charges",
      content: <p>The checkout currently does not calculate or collect a delivery charge. The WhatsApp message says delivery is to be confirmed. Any delivery charge must be clearly communicated and agreed before the order is accepted or payment is requested. The owner should update checkout if charges become fixed or location-based.</p>,
    },
    {
      id: "timing",
      title: "Estimated timing",
      content: <p>Configured delivery estimate: {settings?.deliveryEstimate || "[BUSINESS OWNER: set realistic delivery estimates and explain when the estimate begins]"} . An estimate should be confirmed for each order; no delivery date is promised by this website until confirmed with the customer.</p>,
    },
    {
      id: "process",
      title: "Order and delivery process",
      content: <ol className="list-decimal space-y-2 pl-5">
        <li>Submit checkout to create a pending order. Checkout then opens a pre-filled WhatsApp message; you decide whether to send it.</li>
        <li>The store confirms stock, delivery coverage, charge and timing through WhatsApp or another agreed channel. Until then, the order is not accepted.</li>
        <li>The store will agree how the item is handed over. The app does not integrate a delivery carrier or provide shipment tracking.</li>
      </ol>,
    },
    {
      id: "address",
      title: "Customer information",
      content: <p>Provide a phone number and address where you can be contacted for the order. The store uses those details to confirm arrangements and deliver the order. If an address or contact detail changes, notify the store promptly.</p>,
    },
    {
      id: "issues",
      title: "Delay, failed delivery or missing items",
      content: <p>Contact the store using the order conversation if a delivery is delayed, unsuccessful or incomplete. The store will review the order and agree an appropriate next step, subject to applicable consumer rights. See the <a className="text-primary underline underline-offset-4" href="/returns-and-refunds">returns and refunds policy</a> for product issues.</p>,
    },
  ];

  return <LegalDocument title="Shipping and delivery" summary="Delivery coverage, cost and timing are confirmed with each order; the current checkout does not calculate delivery charges or provide shipment tracking." sections={sections} settings={settings} />;
}
