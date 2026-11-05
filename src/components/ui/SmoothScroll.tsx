'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { journey, measureStops } from '@/lib/journey';

export function SmoothScroll() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.075, wheelMultiplier: 0.9, touchMultiplier: 1.4 });
    journey.lenis = lenis;
    measureStops();
    return () => {
      lenis.destroy();
      journey.lenis = null;
    };
  }, []);
  return null;
}
