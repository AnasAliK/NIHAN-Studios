import { Vector3 } from 'three';
import type { SectionId } from '@/content/portfolio';
import type { StopId } from './journey';

const V = (x: number, y: number, z: number) => new Vector3(x, y, z);

/**
 * World units: the Hidden Gate's door is at z = 0; the mountain range beyond lies at z < 0.
 * Each portfolio section crowns its own peak. Terrain and camera both read this table.
 */
export const PEAKS: { id: SectionId; x: number; z: number; h: number }[] = [
  { id: 'games', x: -17, z: -50, h: 15 },
  { id: 'ai', x: 18, z: -84, h: 19 },
  { id: 'apps', x: -19, z: -118, h: 23 },
  { id: 'web', x: 20, z: -152, h: 27 },
];

/** Height above the summit where each piece of work floats. */
export const SUMMIT_LIFT = 3.4;

export interface Cam {
  pos: Vector3;
  look: Vector3;
  /** Extra points the camera flies through on its way to this stop. */
  via?: Vector3[];
}

export interface Layout {
  mobile: boolean;
  cams: Record<StopId, Cam>;
  summitScale: number;
}

export function getLayout(mobile: boolean): Layout {
  const cams = {
    // Gate sits in the upper ~55% of the screen, clear of the title block below it.
    hero: { pos: V(0, 4.6, mobile ? 48 : 54), look: V(0, mobile ? 0.2 : 0.6, 0) },
    manifesto: { pos: V(mobile ? 0 : 1.5, 3.9, mobile ? 34 : 30), look: V(mobile ? 0 : 3, mobile ? 3 : 6.2, 0) },
    threshold: { pos: V(0, 3.4, mobile ? 11 : 8.5), look: V(0, 4.6, -30) },
    beyond: { pos: V(0, 34, -172), look: V(0, 44, -380) },
  } as Layout['cams'];

  for (const { id, x, z, h } of PEAKS) {
    const top = h + SUMMIT_LIFT;
    cams[id] = mobile
      ? // Mobile: summit centred in the upper half of the screen, text card below.
        { pos: V(x * 0.62, top + 2.4, z + 21), look: V(x * 0.97, top - 3.2, z) }
      : { pos: V(x * 0.4, top + 0.6, z + 17), look: V(x * 0.76, top, z) };
  }
  // Pass cleanly through the door before climbing toward the first peak.
  cams[PEAKS[0].id].via = [V(0, 3.7, -6), V(Math.sign(PEAKS[0].x) * 2.5, 8, -20)];

  return { mobile, cams, summitScale: mobile ? 1.25 : 1.45 };
}
