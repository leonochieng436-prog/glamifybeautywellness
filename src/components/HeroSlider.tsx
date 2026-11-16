"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlideData } from "@/lib/hero-slides";
import { isHttpsUrl } from "@/lib/socials";
import HeroVisual from "@/components/hero/HeroVisual";
import HeroBackground from "@/components/hero/HeroBackground";

const AUTOPLAY_MS = 7000;
const INDICATOR_LABELS = ["Intro", "Anti-aging", "Men", "Women", "Skincare", "Tea"];

export default function HeroSlider({ slides, ctaText }: { slides: HeroSlideData[]; ctaText: string }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStart = useRef<number | null>(null);
  const paused = hovered || reducedMotion;
  const count = slides.length;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  const move = useCallback((direction: number) => {
    setIndex((current) => (current + direction + count) % count);
  }, [count]);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    touchStart.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    const start = touchStart.current;
    touchStart.current = null;
    const end = event.changedTouches[0]?.clientX;
    if (start === null || end === undefined) return;
    const delta = end - start;
    if (Math.abs(delta) > 48) move(delta < 0 ? 1 : -1);
  }

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Product collections"
      aria-live={paused ? "polite" : "off"}
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`hero-slider hero-theme-${slides[index]?.theme.toLowerCase() ?? "blue"} relative isolate overflow-hidden`}
    >
      <HeroBackground imageUrl={slides[index]?.backgroundImageUrl} theme={slides[index]?.theme ?? "BLUE"} />
      <div className="hero-decoration hero-grid-pattern" aria-hidden="true" />
      <div className="hero-glow hero-glow-one" aria-hidden="true" />
      <div className="hero-glow hero-glow-two" aria-hidden="true" />
      <div className="hero-inner mx-auto flex w-full max-w-[1280px] flex-col px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="hero-slides grid flex-1">
          {slides.map((slide, slideIndex) => {
            const active = slideIndex === index;
            const Heading = slideIndex === 0 ? "h1" : "h2";
            return (
              <article
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${slideIndex + 1} of ${count}: ${slide.headline}`}
                aria-hidden={!active}
                inert={!active}
                className={`hero-slide ${active ? "hero-slide-active" : "hero-slide-inactive"}`}
              >
                <div className="hero-copy">
                  <p className="hero-eyebrow">{slide.eyebrow}</p>
                  <Heading className="hero-headline">{slide.headline}</Heading>
                  <p className="mt-4 text-sm font-semibold tracking-wide sm:text-base">{ctaText}</p>
                  <div className="hero-ctas">
                    <Link href={slide.primaryHref} className="hero-button hero-button-primary">{slide.primaryLabel}</Link>
                    {isHttpsUrl(slide.secondaryHref) ? (
                      <a href={slide.secondaryHref} target="_blank" rel="noopener noreferrer" className="hero-button hero-button-secondary">{slide.secondaryLabel}</a>
                    ) : (
                      <Link href={slide.secondaryHref} className="hero-button hero-button-secondary">{slide.secondaryLabel}</Link>
                    )}
                  </div>
                </div>
                <div className="hero-panel"><HeroVisual slide={slide} /></div>
              </article>
            );
          })}
        </div>
        <div className="hero-controls">
          <div className="hero-indicators" role="group" aria-label="Choose a slide">
            {slides.map((slide, slideIndex) => {
              const active = slideIndex === index;
              const label = `${String(slideIndex + 1).padStart(2, "0")} ${INDICATOR_LABELS[slideIndex] ?? slide.eyebrow}`;
              return (
                <button
                  type="button"
                  key={slide.id}
                  onClick={() => setIndex(slideIndex)}
                  aria-label={`Go to slide ${label}`}
                  title={label}
                  aria-current={active ? "true" : undefined}
                  className={`hero-indicator ${active ? "hero-indicator-active" : ""}`}
                >
                  <span>{String(slideIndex + 1).padStart(2, "0")}</span>
                  <span className="hero-indicator-label">{INDICATOR_LABELS[slideIndex] ?? slide.eyebrow}</span>
                  {active && <span key={`${index}-${paused}`} className={`hero-progress ${paused ? "hero-progress-paused" : ""}`} style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />}
                </button>
              );
            })}
          </div>
          <div className="hero-control-buttons">
            <button type="button" onClick={() => move(-1)} aria-label="Previous slide" className="hero-control-button"><ChevronLeft size={20} aria-hidden="true" /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next slide" className="hero-control-button"><ChevronRight size={20} aria-hidden="true" /></button>
          </div>
          <a className="hero-scroll-cue" href="#home-content"><span>Scroll to explore</span><ChevronDown size={16} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
