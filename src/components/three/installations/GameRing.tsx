'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { projectHref, type PortfolioSection, type Project } from '@/content/portfolio';
import { navigate } from '@/lib/navigate';
import { useUI } from '@/lib/store';
import { isUIEvent, type Drive } from '../Summit';
import { materials } from '../materials';

const MAX = 6;
const RADIUS = 2.15;
const IMG = new THREE.Color(0.74, 0.74, 0.74);

/** Pick screens round-robin across projects so every game is represented. */
function pickScreens(projects: Project[]) {
  const out: { src: string; project: Project; index: number }[] = [];
  for (let round = 0; out.length < MAX; round++) {
    let added = false;
    for (const p of projects) {
      if (p.images[round] && out.length < MAX) {
        out.push({ src: p.images[round], project: p, index: round });
        added = true;
      }
    }
    if (!added) break;
  }
  return out;
}

/** Games — a slowly turning carousel of screens around a glowing die. Click a screen to view the game. */
export function GameRing({ drive, section }: { drive: React.RefObject<Drive>; section: PortfolioSection }) {
  const { gold, darkMetal } = materials();
  const screens = useMemo(() => pickScreens(section.projects), [section.projects]);
  const textures = useTexture(
    screens.map((s) => s.src),
    (t) => (Array.isArray(t) ? t : [t]).forEach((x) => ((x.colorSpace = THREE.SRGBColorSpace), (x.anisotropy = 8))),
  );
  const ring = useRef<THREE.Group>(null);
  const die = useRef<THREE.Group>(null);
  const panels = useRef<(THREE.Group | null)[]>([]);
  const hoverIdx = useRef(-1);
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.5, 0)), []);

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    const h = drive.current?.hover ?? 0;
    if (ring.current) ring.current.rotation.y += dt * (hoverIdx.current >= 0 ? 0.03 : 0.2 - h * 0.08);
    if (die.current) die.current.rotation.set(t * 0.5, t * 0.7, t * 0.2);
    panels.current.forEach((p, i) => {
      if (!p) return;
      const on = hoverIdx.current === i ? 1 : 0;
      const s = THREE.MathUtils.damp(p.scale.x, 1 + on * 0.22, 8, dt);
      p.scale.setScalar(s);
      p.position.y = Math.sin(t * 0.9 + i) * 0.1 + on * 0.1;
    });
  });

  const enter = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hoverIdx.current = i;
    useUI.getState().setHover(`View ${screens[i].project.title}`);
  };
  const leave = (i: number) => () => {
    if (hoverIdx.current === i) hoverIdx.current = -1;
    useUI.getState().setHover(null);
  };
  const open = (i: number) => (e: ThreeEvent<MouseEvent>) => {
    if (isUIEvent(e)) return;
    e.stopPropagation();
    useUI.getState().setHover(null);
    navigate(projectHref('games', screens[i].project));
  };

  return (
    <group>
      <group ref={ring}>
        {textures.map((tex, i) => {
          const a = (i / textures.length) * Math.PI * 2;
          const img = tex.image as HTMLImageElement | undefined;
          const aspect = img?.width ? img.width / img.height : 16 / 9;
          const w = 1.7;
          const hgt = w / aspect;
          return (
            <group key={i} rotation-y={a}>
              <group ref={(el) => void (panels.current[i] = el)} position-z={RADIUS}>
                <mesh position-z={-0.03} material={darkMetal}>
                  <boxGeometry args={[w + 0.1, hgt + 0.1, 0.04]} />
                </mesh>
                <mesh position-z={-0.002} material={gold}>
                  <planeGeometry args={[w + 0.06, hgt + 0.06]} />
                </mesh>
                <mesh onPointerOver={enter(i)} onPointerOut={leave(i)} onClick={open(i)}>
                  <planeGeometry args={[w, hgt]} />
                  <meshBasicMaterial map={tex} color={IMG} />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
      <group ref={die}>
        <mesh>
          <icosahedronGeometry args={[0.48, 0]} />
          <meshStandardMaterial color="#120d08" metalness={0.9} roughness={0.25} />
        </mesh>
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={new THREE.Color(2.4, 1.8, 1.0)} toneMapped={false} />
        </lineSegments>
      </group>
    </group>
  );
}
