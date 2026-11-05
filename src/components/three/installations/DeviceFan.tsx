'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, useTexture } from '@react-three/drei';
import type { PortfolioSection } from '@/content/portfolio';
import type { Drive } from '../Summit';
import { materials } from '../materials';

const SCREEN = new THREE.Color(0.78, 0.78, 0.78);

/** Apps — a fan of phones showing real app screens; they spread apart on hover. */
export function DeviceFan({ drive, section }: { drive: React.RefObject<Drive>; section: PortfolioSection }) {
  const { gold } = materials();
  // Take one screen per project before taking a second screen from any project.
  const images = [0, 1, 2]
    .flatMap((index) => section.projects.flatMap((project) => project.images.slice(index, index + 1)))
    .slice(0, 3);
  const textures = useTexture(images, (t) => {
    (Array.isArray(t) ? t : [t]).forEach((x) => {
      x.colorSpace = THREE.SRGBColorSpace;
      x.anisotropy = 8;
    });
  });
  const phones = useRef<(THREE.Group | null)[]>([]);
  const order = textures.length === 3 ? [-1, 0, 1] : textures.map((_, i) => i - (textures.length - 1) / 2);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const h = drive.current?.hover ?? 0;
    phones.current.forEach((p, i) => {
      if (!p) return;
      const k = order[i];
      p.position.x = THREE.MathUtils.damp(p.position.x, k * (1.0 + h * 0.55), 5, dt);
      p.position.z = THREE.MathUtils.damp(p.position.z, -Math.abs(k) * 0.45 + h * 0.2, 5, dt);
      p.position.y = Math.sin(t * 1.1 + i * 1.7) * 0.08;
      p.rotation.y = THREE.MathUtils.damp(p.rotation.y, -k * 0.38 * (1 - h * 0.55), 5, dt);
      p.rotation.z = -k * 0.05;
    });
  });

  return (
    <group scale={1.05}>
      {textures.map((tex, i) => (
        <group key={i} ref={(el) => void (phones.current[i] = el)}>
          <RoundedBox args={[1.02, 2.12, 0.09]} radius={0.09} smoothness={4} material={gold} />
          <mesh position-z={0.05}>
            <planeGeometry args={[0.92, 2.02]} />
            <meshBasicMaterial map={tex} color={SCREEN} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
