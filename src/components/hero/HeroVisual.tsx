import type { HeroSlideData } from "@/lib/hero-slides";

export default function HeroVisual({ slide }: { slide: HeroSlideData }) {
  return (
    <div className={`hero-visual hero-visual-${slide.theme.toLowerCase()} relative flex h-full items-center justify-center`}>
      <span className="hero-watermark" aria-hidden="true">{String(slide.position).padStart(2, "0")}</span>
    </div>
  );
}
