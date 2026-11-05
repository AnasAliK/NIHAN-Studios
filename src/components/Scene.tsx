'use client';

import dynamic from 'next/dynamic';

/** WebGL is client-only; the HTML journey renders on the server for SEO and no-JS readers. */
const Experience = dynamic(() => import('./three/Experience'), { ssr: false });

export function Scene() {
  return (
    <div className="scene-wrap" aria-hidden="true">
      <Experience />
    </div>
  );
}
