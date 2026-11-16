import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveLegalSettings, saveSettings } from "@/app/admin/actions";
import { getSocialUrls } from "@/lib/socials";
import { Button, Card, FormField, Input, PageHeader, Tabs, Textarea, Toast } from "@/components/admin/ui";

export const dynamic = "force-dynamic";
type Query = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => typeof value === "string" ? value : "";
const legalTextFields = [
  ["legalName", "Registered legal business name", "input"],
  ["tradingName", "Trading name", "input"],
  ["registrationDetails", "Business registration details", "input"],
  ["physicalAddress", "Physical or business address", "textarea"],
  ["supportEmail", "Customer support email", "email"],
  ["privacyEmail", "Privacy and data requests email", "email"],
  ["deliveryAreas", "Delivery areas and exclusions", "textarea"],
  ["deliveryEstimate", "Delivery estimates", "textarea"],
  ["returnPeriod", "Return request period", "input"],
  ["refundTimeline", "Refund processing timeline", "input"],
  ["orderRetention", "Order and customer record retention", "textarea"],
  ["newsletterRetention", "Newsletter data retention", "textarea"],
  ["reviewRetention", "Review retention and removal", "textarea"],
  ["securityRetention", "Security and rate-limit log retention", "textarea"],
] as const;

export default async function Settings({ searchParams }: { searchParams: Promise<Query> }) {
  const [settings, session, query] = await Promise.all([
    db.storeSettings.findUniqueOrThrow({ where: { id: 1 } }),
    requireAdmin(),
    searchParams,
  ]);
  const socials = getSocialUrls(settings.socials);
  const saved = one(query.saved);
  const messages: Record<string, string> = {
    settings: "Store settings saved.",
    legal: "Business identity and legal settings saved.",
  };
  const whatsappDigits = settings.whatsappNumber.replace(/\D/g, "");
  const previewNumber = whatsappDigits.startsWith("0") ? `254${whatsappDigits.slice(1)}` : whatsappDigits;

  return (
    <>
      <PageHeader title="Store settings" description="Configure storefront identity, contact details, delivery and announcements." />
      {messages[saved] && <div className="mb-5"><Toast message={messages[saved]} /></div>}
      <Tabs
        initialActive="#general"
        tabs={[
          { label: "General", href: "#general" },
          { label: "Contact and social", href: "#contact" },
          { label: "Delivery", href: "#delivery" },
          { label: "Announcement", href: "#announcement" },
        ]}
      />
      <form action={saveSettings} className="space-y-5">
        <Card id="general" className="scroll-mt-24 p-5">
          <h2 className="mb-4 font-semibold">General</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Business name" htmlFor="businessName"><Input id="businessName" name="businessName" required defaultValue={settings.businessName} /></FormField>
            <FormField label="Logo URL" htmlFor="logoUrl"><Input id="logoUrl" name="logoUrl" type="url" defaultValue={settings.logoUrl ?? ""} placeholder="https://" /></FormField>
          </div>
        </Card>

        <Card id="contact" className="scroll-mt-24 p-5">
          <h2 className="mb-4 font-semibold">Contact and social</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="WhatsApp number" htmlFor="whatsappNumber" hint="Include the country code. Example: 254738783355.">
              <Input id="whatsappNumber" name="whatsappNumber" type="tel" inputMode="tel" pattern="\+?\d{10,15}" required defaultValue={settings.whatsappNumber} />
            </FormField>
            <FormField label="Phone number" htmlFor="phone"><Input id="phone" name="phone" type="tel" inputMode="tel" pattern="\+?\d{10,15}" required defaultValue={settings.phone ?? ""} /></FormField>
            <FormField label="Business email" htmlFor="email"><Input id="email" name="email" type="email" defaultValue={settings.email ?? ""} /></FormField>
            <FormField label="Location" htmlFor="location"><Input id="location" name="location" defaultValue={settings.location ?? ""} /></FormField>
            <FormField label="Business hours" htmlFor="businessHours"><Input id="businessHours" name="businessHours" defaultValue={settings.businessHours ?? ""} /></FormField>
            <FormField label="Facebook URL" htmlFor="facebook"><Input id="facebook" name="facebook" type="url" defaultValue={socials.facebook} placeholder="https://" /></FormField>
            <FormField label="Instagram URL" htmlFor="instagram"><Input id="instagram" name="instagram" type="url" defaultValue={socials.instagram} placeholder="https://" /></FormField>
          </div>
          <p className="mt-4 text-sm text-muted">
            WhatsApp preview:{" "}
            {previewNumber ? <a href={`https://wa.me/${previewNumber}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Open wa.me link</a> : <span>Enter a valid number to preview the link.</span>}
          </p>
        </Card>

        <Card id="delivery" className="scroll-mt-24 p-5">
          <h2 className="mb-4 font-semibold">Delivery</h2>
          <FormField label="Delivery charge (KES)" htmlFor="deliveryChargeKes"><Input id="deliveryChargeKes" name="deliveryChargeKes" type="number" min={0} step={1} defaultValue={settings.deliveryChargeKes ?? ""} /></FormField>
        </Card>

        <Card id="announcement" className="scroll-mt-24 p-5">
          <h2 className="mb-4 font-semibold">Announcement</h2>
          <FormField label="Store announcement" htmlFor="announcement" hint="Leave blank to hide the announcement bar.">
            <Textarea id="announcement" name="announcement" rows={3} defaultValue={settings.announcement ?? ""} />
          </FormField>
        </Card>

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(15,23,42,0.06)] backdrop-blur sm:-mx-6 sm:px-6">
          <Button type="submit">Save store settings</Button>
        </div>
      </form>

      <Card className="mt-8">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-semibold">Business identity and legal settings</h2>
          <p className="mt-1 text-sm text-muted">Verify all entries and obtain Kenyan legal review before publishing.</p>
        </div>
        {session.role === "ADMIN" ? (
          <form action={saveLegalSettings} className="grid gap-4 p-5 sm:grid-cols-2">
            {legalTextFields.map(([name, label, type]) => (
              <FormField key={name} label={label} htmlFor={name}>
                {type === "textarea"
                  ? <Textarea id={name} name={name} defaultValue={String(settings[name as keyof typeof settings] ?? "")} />
                  : <Input id={name} name={name} type={type === "email" ? "email" : "text"} defaultValue={String(settings[name as keyof typeof settings] ?? "")} />}
              </FormField>
            ))}
            <FormField label="Policy version" htmlFor="legalPolicyVersion"><Input id="legalPolicyVersion" name="legalPolicyVersion" required maxLength={40} defaultValue={settings.legalPolicyVersion ?? "draft-1"} /></FormField>
            <FormField label="Effective date" htmlFor="legalEffectiveDate"><Input id="legalEffectiveDate" name="legalEffectiveDate" type="date" defaultValue={settings.legalEffectiveDate?.toISOString().slice(0, 10) ?? ""} /></FormField>
            <div className="sm:col-span-2"><Button type="submit">Save legal settings</Button></div>
          </form>
        ) : (
          <p className="p-5 text-sm text-muted">Business identity and legal policy details can only be edited by an admin.</p>
        )}
      </Card>
    </>
  );
}
