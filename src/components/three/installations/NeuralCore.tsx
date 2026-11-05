'use client';

import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard, useTexture } from '@react-three/drei';
import type { PortfolioSection } from '@/content/portfolio';
import type { Drive } from '../Summit';
import { materials } from '../materials';
import { useUI } from '@/lib/store';

const N = 120;
const R = 1.55;
const GOLD = new THREE.Color(1.9, 1.45, 0.85);

/** AI — a living constellation of nodes with signals pulsing through it. */
export function NeuralCore({ drive, section }: { drive: React.RefObject<Drive>; section: PortfolioSection }) {
  const { gold } = materials();
  const group = useRef<THREE.Group>(null);
  const inst = useRef<THREE.InstancedMesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);

  const { nodes, lineGeo } = useMemo(() => {
    const nodes: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      const rad = R * (0.78 + Math.random() * 0.32);
      nodes.push(new THREE.Vector3(Math.cos(th) * r * rad, y * rad, Math.sin(th) * r * rad));
    }
    const seg: number[] = [];
    nodes.forEach((a, i) => {
      nodes
        .map((b, j) => ({ j, d: a.distanceToSquared(b) }))
        .filter((o) => o.j > i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 3)
        .forEach(({ j }) => seg.push(a.x, a.y, a.z, nodes[j].x, nodes[j].y, nodes[j].z));
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    return { nodes, lineGeo };
  }, []);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    nodes.forEach((p, i) => {
      m.makeTranslation(p.x, p.y, p.z);
      inst.current!.setMatrixAt(i, m);
      inst.current!.setColorAt(i, GOLD);
    });
    inst.current!.instanceMatrix.needsUpdate = true;
  }, [nodes]);

  const dir = useMemo(() => new THREE.Vector3(), []);
  const col = useMemo(() => new THREE.Color(), []);

  useFrame(({ clock, pointer }, dt) => {
    const t = clock.elapsedTime;
    const h = drive.current?.hover ?? 0;
    if (group.current) {
      group.current.rotation.y += dt * (0.18 + h * 0.9);
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.y * 0.4 * h, 4, dt);
    }
    dir.set(Math.sin(t * 0.7), Math.cos(t * 0.5), Math.sin(t * 0.3)).normalize();
    nodes.forEach((p, i) => {
      const wave = Math.sin(p.dot(dir) * 3.2 - t * (2.4 + h * 3));
      const b = 0.35 + Math.pow(Math.max(0, wave), 6) * (2.4 + h * 2);
      inst.current!.setColorAt(i, col.copy(GOLD).multiplyScalar(b));
    });
    inst.current!.instanceColor!.needsUpdate = true;
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.07 + h * 0.15);
    if (lines.current) (lines.current.material as THREE.LineBasicMaterial).opacity = 0.22 + h * 0.35;
    if (ringA.current) ringA.current.rotation.set(t * 0.3, t * 0.2, 0);
    if (ringB.current) ringB.current.rotation.set(-t * 0.25, 0, t * 0.35);
  });

  const images = [0, 1, 2]
    .flatMap((index) => section.projects.flatMap((project) => project.images.slice(index, index + 1)))
    .slice(0, 3);

  return (
    <group>
      <group ref={group}>
        <instancedMesh ref={inst} args={[undefined, undefined, N]}>
          <sphereGeometry args={[0.042, 10, 10]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
        <lineSegments ref={lines} geometry={lineGeo}>
          <lineBasicMaterial color={new THREE.Color(1.3, 1, 0.6)} transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </lineSegments>
        <mesh>
          <icosahedronGeometry args={[0.95, 1]} />
          <meshBasicMaterial color={new THREE.Color(0.9, 0.7, 0.4)} wireframe transparent opacity={0.18} toneMapped={false} />
        </mesh>
      </group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.42, 3]} />
        <meshBasicMaterial color={new THREE.Color(4, 3, 1.8)} toneMapped={false} />
      </mesh>
      <mesh ref={ringA} material={gold}>
        <torusGeometry args={[2.05, 0.022, 8, 128]} />
      </mesh>
      <mesh ref={ringB} material={gold}>
        <torusGeometry args={[2.3, 0.016, 8, 128]} />
      </mesh>
      {images.length > 0 && <OrbitCards images={images} />}
    </group>
  );
}

/** Project images orbiting the core — appear automatically once AI projects have images. */
function OrbitCards({ images }: { images: string[] }) {
  const textures = useTexture(images, (t) => {
    (Array.isArray(t) ? t : [t]).forEach((x) => {
      x.colorSpace = THREE.SRGBColorSpace;
      x.anisotropy = 8;
    });
  });
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y -= dt * 0.08;
  });
  return (
    <group ref={ref}>
      {textures.map((tex, i) => {
        const a = (i / textures.length) * Math.PI * 2;
        const image = tex.image as HTMLImageElement;
        const aspect = image.width / image.height;
        const width = 2.3 * Math.min(aspect, 1);
        const height = width / aspect;
        return (
          <Billboard key={i} position={[Math.cos(a) * 2.3, Math.sin(a * 2) * 0.4, Math.sin(a) * 2.3]}>
            <mesh onClick={(event) => {
              event.stopPropagation();
              useUI.getState().openLightbox(images, i, 'Project screenshots');
            }}>
              <planeGeometry args={[width, height]} />
              <meshBasicMaterial map={tex} toneMapped={false} />
            </mesh>
          </Billboard>
        );
      })}
    </group>
  );
}
