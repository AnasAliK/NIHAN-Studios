import type Lenis from 'lenis';

/** Ordered scroll stops. Each one is a <section id> in the overlay and a camera keyframe in the scene. */
export const STOPS = ['hero', 'manifesto', 'threshold', 'games', 'ai', 'apps', 'web', 'beyond'] as const;
export type StopId = (typeof STOPS)[number];

/**
 * Mutable, non-reactive state shared between the DOM overlay and the WebGL scene.
 * Read inside animation loops — never trigger React renders from here.
 */
export const journey = {
  lenis: null as Lenis | null,
  /** Scroll progress (0–1) at which the camera rests on each stop. */
  stopT: Object.fromEntries(STOPS.map((id, i) => [id, i / (STOPS.length - 1)])) as Record<StopId, number>,
  /** Dev only: force camera progress (0–1) without scrolling, via window.__journey in the console. */
  previewT: null as number | null,
};

if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as { __journey: typeof journey }).__journey = journey;
}

export function maxScroll() {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

/** Scroll position where a section's sticky panel is centred in its hold. */
export function stopScrollTop(id: StopId) {
  if (id === 'hero') return 0;
  if (id === 'beyond') return maxScroll();
  const el = document.getElementById(id);
  if (!el) return 0;
  return el.offsetTop + (el.offsetHeight - window.innerHeight) / 2;
}

export function measureStops() {
  const max = maxScroll();
  for (const id of STOPS) journey.stopT[id] = Math.min(1, Math.max(0, stopScrollTop(id) / max));
}

export function scrollToStop(id: StopId) {
  const top = stopScrollTop(id);
  if (journey.lenis) journey.lenis.scrollTo(top, { duration: 2.4 });
  else window.scrollTo({ top, behavior: 'smooth' });
}
