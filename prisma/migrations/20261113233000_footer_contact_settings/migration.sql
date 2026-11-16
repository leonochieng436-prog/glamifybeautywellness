ALTER TABLE "StoreSettings"
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "businessHours" TEXT;

UPDATE "StoreSettings"
SET
  "phone" = CASE
    WHEN "whatsappNumber" = '254700000000' THEN '+254738783355'
    ELSE "whatsappNumber"
  END,
  "whatsappNumber" = CASE
    WHEN "whatsappNumber" = '254700000000' THEN '254738783355'
    ELSE "whatsappNumber"
  END,
  "location" = CASE
    WHEN "location" IS NULL OR BTRIM("location") = '' THEN 'Nairobi CBD'
    ELSE "location"
  END
WHERE "phone" IS NULL;
