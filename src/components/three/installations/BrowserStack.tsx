'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import type { PortfolioSection } from '@/content/portfolio';
import { websiteTexture } from '@/lib/textures';
import type { Drive } from '../Summit';

const W = 2.7;
const H = 1.72;

/** Websites — layered browser windows that separate into an exploded view on hover. */
export function BrowserStack({ drive, section }: { drive: React.RefObject<Drive>; section: PortfolioSection }) {
  const images = [0, 1, 2]
    .flatMap((index) => section.projects.flatMap((project) => project.images.slice(index, index + 1)))
    .slice(0, 3);
  return images.length ? <ImageStack drive={drive} images={images} /> : <ProceduralStack drive={drive} />;
}

function ImageStack({ drive, images }: { drive: React.RefObject<Drive>; images: string[] }) {
  const textures = useTexture(images, (t) =>
    (Array.isArray(t) ? t : [t]).forEach((x) => ((x.colorSpace = THREE.SRGBColorSpace), (x.anisotropy = 8))),
  );
  return <Stack drive={drive} textures={textures} framed />;
}

function ProceduralStack({ drive }: { drive: React.RefObject<Drive> }) {
  const textures = useMemo(() => [0, 1, 2].map((v) => websiteTexture(v)), []);
  // Redraw once web fonts are ready so canvas text uses them.
  useEffect(() => {
    document.fonts?.ready.then(() => {
      textures.forEach((t, i) => {
        const fresh = websiteTexture(i);
        t.image = fresh.image;
        t.needsUpdate = true;
      });
    });
  }, [textures]);
  return <Stack drive={drive} textures={textures} />;
}

function Stack({ drive, textures, framed }: { drive: React.RefObject<Drive>; textures: THREE.Texture[]; framed?: boolean }) {
  const layers = useRef<(THREE.Mesh | null)[]>([]);
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock, pointer }, dt) => {
    const t = clock.elapsedTime;
    const h = drive.current?.hover ?? 0;
    layers.current.forEach((m, i) => {
      if (!m) return;
      const depth = i * (0.32 + h * 0.75);
      m.position.z = THREE.MathUtils.damp(m.position.z, -depth, 5, dt);
      m.position.x = THREE.MathUtils.damp(m.position.x, i * (0.32 + h * 0.2), 5, dt);
      m.position.y = THREE.MathUtils.damp(m.position.y, i * (0.26 + h * 0.15), 5, dt) + Math.sin(t + i) * 0.003;
    });
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.18 + pointer.x * 0.35 * h, 4, dt);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * 0.2 * h, 4, dt);
      group.current.position.y = Math.sin(t * 0.8) * 0.06;
    }
  });

  return (
    <group ref={group} position={[-0.3, -0.2, 0]}>
      {textures.map((tex, i) => (
        <mesh key={i} ref={(el) => void (layers.current[i] = el)} renderOrder={-i}>
          <planeGeometry args={[W, framed ? W / ((tex.image as HTMLImageElement)?.width / (tex.image as HTMLImageElement)?.height || 16 / 10) : H]} />
          <meshBasicMaterial
            map={tex}
            transparent
            side={THREE.DoubleSide}
            color={framed ? new THREE.Color(0.75, 0.75, 0.75) : new THREE.Color(1.25, 1.25, 1.25)}
            opacity={1 - i * 0.12}
            depthWrite={i === 0}
            toneMapped={!!framed}
          />
        </mesh>
      ))}
    </group>
  );
}
