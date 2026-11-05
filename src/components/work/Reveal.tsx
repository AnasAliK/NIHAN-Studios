'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Fades/slides in every [data-reveal] element as it enters the viewport.
 * Only arms itself once JS runs, so content stays visible without it.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('reveal-ready');
    const els = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
