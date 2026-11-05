'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Billboard, MeshReflectorMaterial } from '@react-three/drei';
import { archBand, archPoints, crescent, deg } from '@/lib/shapes';
import { radialTexture, verticalTexture } from '@/lib/textures';
import { materials } from './materials';

/** Door opening of the Hidden Gate — the camera flies through it. */
export const DOOR = { w: 2.4, h: 6.5, top: 2.4 };

const EXTRUDE: THREE.ExtrudeGeometryOptions = {
  depth: 0.34,
  bevelEnabled: true,
  bevelThickness: 0.07,
  bevelSize: 0.05,
  bevelSegments: 3,
  curveSegments: 32,
};

export function Gate({ quality }: { quality: 'high' | 'low' }) {
  const { gold, glow } = materials();
  const edgeMat = useMemo(() => glow(2.6, 2.0, 1.35), [glow]);
  const beam = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);

  const g = useMemo(() => {
    const arch = new THREE.ExtrudeGeometry(archBand(6, 8, 4.2, 0.36), EXTRUDE);
    const crL = new THREE.ExtrudeGeometry(crescent(8.4, 0.78, deg(124), deg(244)), EXTRUDE);
    const crR = new THREE.ExtrudeGeometry(crescent(8.4, 0.78, deg(-64), deg(56)), EXTRUDE);
    const edge = new THREE.ExtrudeGeometry(archBand(DOOR.w + 0.2, DOOR.h, DOOR.top + 0.11, 0.1), {
      depth: 0.1,
      bevelEnabled: false,
      curveSegments: 32,
    });

    const spikeShape = new THREE.Shape([new THREE.Vector2(-0.09, 0), new THREE.Vector2(0.09, 0), new THREE.Vector2(0, 1.5)]);
    const spike = new THREE.ExtrudeGeometry(spikeShape, { ...EXTRUDE, depth: 0.2, bevelSize: 0.02, bevelThickness: 0.03 });

    // The veil of darkness: a vast wall pierced only by the door.
    const wallShape = new THREE.Shape();
    wallShape.moveTo(-500, -50);
    wallShape.lineTo(500, -50);
    wallShape.lineTo(500, 400);
    wallShape.lineTo(-500, 400);
    wallShape.holes.push(new THREE.Path(archPoints(DOOR.w, DOOR.h, DOOR.top, 40)));
    const wall = new THREE.ShapeGeometry(wallShape, 40);

    return { arch, crL, crR, edge, spike, wall };
  }, []);

  const tex = useMemo(
    () => ({
      halo: radialTexture([
        [0, 'rgba(255,226,170,0.9)'],
        [0.25, 'rgba(255,200,130,0.28)'],
        [1, 'rgba(0,0,0,0)'],
      ]),
      beam: verticalTexture([
        [0, 'rgba(255,230,180,0)'],
        [0.55, 'rgba(255,230,180,0.65)'],
        [1, 'rgba(255,240,210,1)'],
      ]),
      pool: radialTexture([
        [0, 'rgba(255,214,150,0.55)'],
        [0.4, 'rgba(255,190,120,0.12)'],
        [1, 'rgba(0,0,0,0)'],
      ]),
    }),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (beam.current) (beam.current.material as THREE.MeshBasicMaterial).opacity = 0.75 + Math.sin(t * 1.3) * 0.15;
    if (halo.current) (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.32 + Math.sin(t * 0.8) * 0.05;
  });

  return (
    <group>
      {/* Darkness */}
      <mesh geometry={g.wall} position-z={-0.02}>
        <meshBasicMaterial color="#030202" />
      </mesh>

      {/* Veil — crescents */}
      <group position={[0, 7.2, 0]}>
        <mesh geometry={g.crL} material={gold} />
        <mesh geometry={g.crR} material={gold} />
      </group>

      {/* Arch frame + finial */}
      <mesh geometry={g.arch} material={gold} />
      <mesh geometry={g.spike} material={gold} position={[0, 12.05, 0.06]} />

      {/* Doorway light edge */}
      <mesh geometry={g.edge} material={edgeMat} position-z={0.01} />

      {/* Light rising from the door's tip */}
      <mesh ref={beam} position={[0, 12.4, 0.3]}>
        <planeGeometry args={[0.05, 7]} />
        <meshBasicMaterial
          map={tex.beam}
          color={new THREE.Color(3, 2.6, 2)}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <Billboard position={[0, 5, 0.8]}>
        <mesh ref={halo}>
          <planeGeometry args={[11, 14]} />
          <meshBasicMaterial map={tex.halo} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.32} />
        </mesh>
      </Billboard>

      {/* Floor of the threshold */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 100]}>
        <planeGeometry args={[400, 200]} />
        {quality === 'high' ? (
          <MeshReflectorMaterial
            blur={[400, 120]}
            resolution={1024}
            mixBlur={1}
            mixStrength={0.9}
            roughness={0.85}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#070605"
            metalness={0.3}
            mirror={0.3}
          />
        ) : (
          <meshStandardMaterial color="#0d0b09" roughness={0.75} metalness={0.4} />
        )}
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 3]}>
        <planeGeometry args={[9, 11]} />
        <meshBasicMaterial map={tex.pool} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.5} />
      </mesh>

      <pointLight position={[0, 4.5, 2.4]} color="#ffcc88" intensity={70} distance={45} decay={1.7} />
      <pointLight position={[0, 13, 3]} color="#ffd9a8" intensity={18} distance={20} decay={1.8} />
    </group>
  );
}
