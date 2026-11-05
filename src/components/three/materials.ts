import * as THREE from 'three';
import { grainTexture } from '@/lib/textures';

/** Shared materials, created once on the client. */
let cache: ReturnType<typeof create> | null = null;

function create() {
  const grain = grainTexture(512, 7);
  grain.repeat.set(0.3, 0.3);
  const stoneGrain = grainTexture(512, 3);
  stoneGrain.repeat.set(0.18, 0.18);

  const gold = new THREE.MeshStandardMaterial({
    color: '#c9a36a',
    metalness: 1,
    roughness: 0.42,
    roughnessMap: grain,
    bumpMap: grain,
    bumpScale: 1.4,
  });

  const darkMetal = new THREE.MeshStandardMaterial({
    color: '#2a2119',
    metalness: 0.85,
    roughness: 0.5,
    roughnessMap: grain,
    bumpMap: grain,
    bumpScale: 0.8,
  });

  const stone = new THREE.MeshStandardMaterial({
    color: '#221c16',
    metalness: 0.15,
    roughness: 0.92,
    bumpMap: stoneGrain,
    bumpScale: 2.5,
  });

  /** Unlit HDR glow: values above 1 feed the bloom pass. */
  const glow = (r: number, g: number, b: number) =>
    new THREE.MeshBasicMaterial({ color: new THREE.Color(r, g, b), toneMapped: false });

  return { gold, darkMetal, stone, glow };
}

export function materials() {
  if (!cache) cache = create();
  return cache;
}
