'use client';

import { useEffect } from 'react';
import { useUI } from '@/lib/store';
import Image from 'next/image';

export function Loader() {
  const loaded = useUI((s) => s.loaded);

  useEffect(() => {
    // Never trap visitors behind the loader (e.g. WebGL unavailable).
    const id = window.setTimeout(() => useUI.getState().setLoaded(), 12000);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('is-loaded', loaded);
  }, [loaded]);

  return (
    <div className={`loader${loaded ? ' loader--done' : ''}`} role="status" aria-live="polite" aria-hidden={loaded}>
      <div className="loader__portal" aria-hidden="true">
        <span className="loader__orbit" />
        <span className="loader__orbit loader__orbit--inner" />
        <Image className="loader__logo" src="/assets/brand/nihan-transparent.png" alt="" width={132} height={150} priority />
      </div>
      <div className="loader__name">NIHĀN</div>
      <p className="loader__message">Opening the hidden gate</p>
      <div className="loader__bar">
        <span id="loader-progress" />
      </div>
      <p className="loader__hint">Scroll to explore the worlds beyond.</p>
    </div>
  );
}
