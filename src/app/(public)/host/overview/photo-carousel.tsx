"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BLUR_DATA_URL } from "@/lib/blur";

export type CarouselSlide = { src: string; alt: string };

/**
 * Instagram-style photo carousel: one image visible at a time, swipe/scroll
 * horizontally with snap. Native touch swipe (CSS scroll-snap); arrows, dots,
 * and the counter sync to scroll position. Auto-advances every 5s, pausing on
 * hover / focus / touch and under prefers-reduced-motion. The active slide
 * gets a slow Ken Burns drift.
 */
export function PhotoCarousel({
  slides,
  aspect = "aspect-[4/5]",
  label = "Photo carousel",
}: {
  slides: CarouselSlide[];
  aspect?: string;
  label?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  function scrollToIndex(i: number) {
    const track = trackRef.current;
    if (track) track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }

  function go(i: number) {
    const clamped = Math.max(0, Math.min(i, slides.length - 1));
    scrollToIndex(clamped);
    setIndex(clamped);
  }

  function onScroll() {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== index) setIndex(i);
  }

  // Auto-advance — pauses on interaction, single slide, or reduced-motion.
  useEffect(() => {
    if (paused || slides.length <= 1) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setIndex((cur) => {
        const next = (cur + 1) % slides.length;
        scrollToIndex(next);
        return next;
      });
    }, 5000);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  return (
    <div
      className="relative mx-auto max-w-md"
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain border border-ink/15 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((s, i) => (
          <div
            key={s.src}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
            className={`relative ${aspect} w-full shrink-0 snap-center overflow-hidden bg-bone-2/40`}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              sizes="(min-width: 768px) 448px, 100vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className={`object-cover ${i === index ? "ken-burns" : ""}`}
            />
          </div>
        ))}
      </div>

      {/* Counter */}
      <div
        className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono-data text-[10px] tracking-[0.15em] text-bone"
        aria-hidden
      >
        {index + 1} / {slides.length}
      </div>
      <span className="sr-only" aria-live="polite">
        Photo {index + 1} of {slides.length}
      </span>

      {/* Arrows */}
      <button
        type="button"
        onClick={() => go(index - 1)}
        disabled={index === 0}
        aria-label="Previous photo"
        className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bone/85 text-ink shadow ring-1 ring-ink/10 transition hover:bg-bone disabled:pointer-events-none disabled:opacity-0"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => go(index + 1)}
        disabled={index === slides.length - 1}
        aria-label="Next photo"
        className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bone/85 text-ink shadow ring-1 ring-ink/10 transition hover:bg-bone disabled:pointer-events-none disabled:opacity-0"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => go(i)}
            aria-label={`Go to photo ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-gold-deep" : "w-1.5 bg-ink/25 hover:bg-ink/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
