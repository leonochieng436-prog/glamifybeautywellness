ALTER TABLE "Order"
  ADD COLUMN "termsVersion" TEXT,
  ADD COLUMN "termsAcceptedAt" TIMESTAMP(3);

ALTER TABLE "NewsletterSubscriber"
  ADD COLUMN "consentVersion" TEXT,
  ADD COLUMN "consentedAt" TIMESTAMP(3);

ALTER TABLE "StoreSettings"
  ADD COLUMN "legalName" TEXT,
  ADD COLUMN "tradingName" TEXT,
  ADD COLUMN "registrationDetails" TEXT,
  ADD COLUMN "physicalAddress" TEXT,
  ADD COLUMN "supportEmail" TEXT,
  ADD COLUMN "privacyEmail" TEXT,
  ADD COLUMN "deliveryAreas" TEXT,
  ADD COLUMN "deliveryEstimate" TEXT,
  ADD COLUMN "returnPeriod" TEXT,
  ADD COLUMN "refundTimeline" TEXT,
  ADD COLUMN "orderRetention" TEXT,
  ADD COLUMN "newsletterRetention" TEXT,
  ADD COLUMN "reviewRetention" TEXT,
  ADD COLUMN "securityRetention" TEXT,
  ADD COLUMN "legalPolicyVersion" TEXT,
  ADD COLUMN "legalEffectiveDate" TIMESTAMP(3);
