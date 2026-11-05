'use client';

import { useEffect } from 'react';
import { journey } from '@/lib/journey';
import { useUI } from '@/lib/store';

export function Lightbox() {
  const lb = useUI((s) => s.lightbox);
  const close = useUI((s) => s.closeLightbox);
  const step = useUI((s) => s.stepLightbox);

  useEffect(() => {
    if (!lb) return;
    journey.lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      journey.lenis?.start();
    };
  }, [lb, close, step]);

  const many = (lb?.images.length ?? 0) > 1;

  return (
    <div className={`lightbox${lb ? ' lightbox--open' : ''}`} role="dialog" aria-modal="true" aria-hidden={!lb} onClick={close}>
      <button className="lightbox__close" onClick={close} aria-label="Close">
        ✕
      </button>
      {many && (
        <button className="lightbox__nav lightbox__nav--prev" onClick={(e) => (e.stopPropagation(), step(-1))} aria-label="Previous image">
          ‹
        </button>
      )}
      {lb && (
        <figure onClick={(e) => e.stopPropagation()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={lb.images[lb.index]} src={lb.images[lb.index]} alt={lb.caption} />
          <figcaption>
            {lb.caption}
            {many && <span> · {lb.index + 1} / {lb.images.length}</span>}
          </figcaption>
        </figure>
      )}
      {many && (
        <button className="lightbox__nav lightbox__nav--next" onClick={(e) => (e.stopPropagation(), step(1))} aria-label="Next image">
          ›
        </button>
      )}
    </div>
  );
}
