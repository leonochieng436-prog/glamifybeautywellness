import { db } from "@/lib/db";

export const LEGAL_POLICY_VERSION_FALLBACK = "draft-1";
export const LEGAL_CONTENT_UPDATED = "13 November 2026";
export const NEWSLETTER_CONSENT_VERSION = "newsletter-v1";

export async function getLegalSettings() {
  return db.storeSettings.findUnique({
    where: { id: 1 },
    select: {
      legalName: true,
      tradingName: true,
      registrationDetails: true,
      physicalAddress: true,
      supportEmail: true,
      privacyEmail: true,
      deliveryAreas: true,
      deliveryEstimate: true,
      returnPeriod: true,
      refundTimeline: true,
      orderRetention: true,
      newsletterRetention: true,
      reviewRetention: true,
      securityRetention: true,
      legalPolicyVersion: true,
      legalEffectiveDate: true,
    },
  });
}

export type LegalSettings = NonNullable<Awaited<ReturnType<typeof getLegalSettings>>>;
