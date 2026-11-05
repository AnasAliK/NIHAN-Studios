'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

/** Full-bleed cover image that drifts slower than the page and gently zooms out as you scroll. */
export function ParallaxCover({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Only work while scrolling: one frame per scroll burst, nothing at rest (keeps the intro animation smooth).
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const y = Math.min(window.scrollY, window.innerHeight);
      el.style.transform = `translate3d(0, ${y * 0.35}px, 0) scale(${1.12 - (y / window.innerHeight) * 0.08})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="project-hero__media" aria-hidden="true">
      <div ref={ref} className="project-hero__img">
        <Image src={src} alt={alt} fill priority sizes="100vw" />
      </div>
    </div>
  );
}
