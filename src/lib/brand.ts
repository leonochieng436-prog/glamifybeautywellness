import type { StoreSettings } from "@prisma/client";
import { db } from "@/lib/db";

export type Brand = {
  name: string;
  logoUrl: string | null;
  tagline: string;
  ctaText: string;
};

type BrandSettings = Pick<StoreSettings, "businessName" | "logoUrl">;

const DEFAULT_TAGLINE = "Nairobi's beauty and wellness shop.";
const DEFAULT_CTA_TEXT = "A little more wellness in your day.";

export async function getBrand(settings?: BrandSettings | null): Promise<Brand> {
  const current = settings === undefined
    ? await db.storeSettings.findUnique({
      where: { id: 1 },
      select: { businessName: true, logoUrl: true },
    })
    : settings;

  return {
    name: current?.businessName || "Beauty & Wellness Store",
    logoUrl: current?.logoUrl ?? null,
    tagline: DEFAULT_TAGLINE,
    ctaText: DEFAULT_CTA_TEXT,
  };
}