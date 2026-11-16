import { z } from "zod";

export const heroThemeSchema = z.enum(["BLUE", "BLACK", "LIGHT"]);

export type HeroSlideTheme = z.infer<typeof heroThemeSchema>;

export type HeroSlideData = {
  id: string;
  position: number;
  theme: HeroSlideTheme;
  backgroundImageUrl?: string | null;
  eyebrow: string;
  headline: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export type HeroActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const DEFAULT_INTRO_CONTENT: Omit<HeroSlideData, "id"> = {
  position: 1,
  theme: "BLUE",
  backgroundImageUrl: null,
  eyebrow: "Beauty. Wellness. Confidence.",
  headline: "A considered collection for everyday beauty and wellness.",
  primaryLabel: "Shop GlamifyBeauty",
  primaryHref: "/shop",
  secondaryLabel: "How to order",
  secondaryHref: "/how-to-order",
};

export const DEFAULT_INTRO_SLIDE: HeroSlideData = {
  id: "fallback-introduction",
  ...DEFAULT_INTRO_CONTENT,
};

export const HERO_SLIDE_SEEDS: Omit<HeroSlideData, "id">[] = [
  { ...DEFAULT_INTRO_CONTENT },
  {
    position: 2,
    theme: "BLACK",
    eyebrow: "Anti-aging support",
    headline: "Supplements for healthy-looking skin, hair and nails.",
    primaryLabel: "Shop anti-aging",
    primaryHref: "/shop?collection=anti-aging",
    secondaryLabel: "Browse all products",
    secondaryHref: "/shop",
  },
  {
    position: 3,
    theme: "LIGHT",
    eyebrow: "For men",
    headline: "Daily wellness essentials for men.",
    primaryLabel: "Shop men's range",
    primaryHref: "/shop?collection=mens",
    secondaryLabel: "Browse all products",
    secondaryHref: "/shop",
  },
  {
    position: 4,
    theme: "BLUE",
    eyebrow: "For women",
    headline: "Everyday wellness, curated for women.",
    primaryLabel: "Shop women's range",
    primaryHref: "/shop?collection=womens",
    secondaryLabel: "Browse all products",
    secondaryHref: "/shop",
  },
  {
    position: 5,
    theme: "LIGHT",
    eyebrow: "Skincare",
    headline: "A simple daily skincare routine.",
    primaryLabel: "Shop skincare",
    primaryHref: "/shop?collection=skincare",
    secondaryLabel: "Browse all products",
    secondaryHref: "/shop",
  },
  {
    position: 6,
    theme: "BLACK",
    eyebrow: "Tea",
    headline: "Herbal teas for your daily ritual.",
    primaryLabel: "Shop teas",
    primaryHref: "/shop?collection=tea",
    secondaryLabel: "Browse all products",
    secondaryHref: "/shop",
  },
];

export function normalizeHeroSlide(value: {
  id: string;
  position: number;
  theme: string;
  backgroundImageUrl?: string | null;
  eyebrow: string;
  headline: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
}): HeroSlideData {
  const theme = heroThemeSchema.safeParse(value.theme);

  return {
    id: value.id,
    position: value.position,
    theme: theme.success ? theme.data : "BLUE",
    backgroundImageUrl: value.backgroundImageUrl ?? null,
    eyebrow: value.eyebrow,
    headline: value.headline,
    primaryLabel: value.primaryLabel,
    primaryHref: value.primaryHref,
    secondaryLabel: value.secondaryLabel,
    secondaryHref: value.secondaryHref,
  };
}
