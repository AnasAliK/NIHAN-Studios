'use client';

import { useEffect, useRef } from 'react';
import { useUI } from '@/lib/store';

/** Gold ring cursor with a label for 3D hover targets. Fine pointers only. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const hover = useUI((s) => s.hover);

  useEffect(() => {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.documentElement.classList.add('has-cursor');
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const cur = { ...pos };
    let raf = 0;
    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const el = e.target as Element | null;
      ring.current?.classList.toggle('cursor--ui', !!el?.closest?.('a, button, .shot'));
    };
    const loop = () => {
      cur.x += (pos.x - cur.x) * 0.22;
      cur.y += (pos.y - cur.y) * 0.22;
      if (ring.current) ring.current.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      if (label.current) label.current.style.transform = `translate3d(${pos.x + 22}px, ${pos.y + 14}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', move);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('is-3d-hover', !!hover);
  }, [hover]);

  return (
    <>
      <div className={`cursor${hover ? ' cursor--hover' : ''}`} ref={ring} aria-hidden="true" />
      <div className={`cursor-label${hover ? ' cursor-label--on' : ''}`} ref={label} aria-hidden="true">
        {hover}
      </div>
    </>
  );
}
