'use client';

import Image from 'next/image';
import { useUI } from '@/lib/store';
import { TiltCard } from '@/components/work/TiltCard';

/** Staggered, tilting thumbnail grid that opens the shared lightbox. */
export function Gallery({ images, title, portrait }: { images: string[]; title: string; portrait?: boolean }) {
  const open = useUI((s) => s.openLightbox);
  return (
    <div className={`gallery${portrait ? ' gallery--tall' : ''}`}>
      {images.map((src, i) => (
        <div key={src} className={`gallery__item${!portrait && i % 5 === 0 ? ' gallery__item--wide' : ''}`} data-reveal style={{ '--d': `${(i % 4) * 80}ms` } as React.CSSProperties}>
          <TiltCard max={5}>
            <button className="shot" onClick={() => open(images, i, title)} aria-label={`Open ${title} image ${i + 1}`}>
              <Image
                src={src}
                alt={`${title} — image ${i + 1}`}
                fill
                sizes={portrait ? '(max-width: 768px) 45vw, 240px' : '(max-width: 768px) 90vw, 50vw'}
              />
              <span className="shot__zoom" aria-hidden="true">
                +
              </span>
            </button>
          </TiltCard>
        </div>
      ))}
    </div>
  );
}
