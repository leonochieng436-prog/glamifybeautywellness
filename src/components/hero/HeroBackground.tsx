import type { HeroSlideTheme } from "@/lib/hero-slides";

export default function HeroBackground({
  imageUrl,
  theme,
}: {
  imageUrl?: string | null;
  theme: HeroSlideTheme;
}) {
  if (!imageUrl) return null;

  return (
    <div
      className={`hero-background hero-background-${theme.toLowerCase()}`}
      aria-hidden="true"
      style={{
        backgroundImage: `linear-gradient(var(--hero-image-overlay-start), var(--hero-image-overlay-end)), url(${JSON.stringify(imageUrl)})`,
      }}
    />
  );
}
