'use client';

import dynamic from 'next/dynamic';
import type { SectionId } from '@/content/portfolio';

const SectionScene = dynamic(() => import('../three/SectionScene'), { ssr: false });

/** Load the scene immediately in its own client-side bundle. */
export function SectionHero3D({ id }: { id: SectionId }) {
  return (
    <div className="page-hero__scene" aria-hidden="true">
      <SectionScene id={id} />
      <span className="page-hero__scene-hint">Drag to turn</span>
    </div>
  );
}
