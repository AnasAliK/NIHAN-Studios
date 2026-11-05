'use client';

import { useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { smoothstep } from '@/lib/noise';
import { verticalTexture, radialTexture } from '@/lib/textures';
import { useUI } from '@/lib/store';
import { navigate } from '@/lib/navigate';
import { SUMMIT_LIFT, type PEAKS } from '@/lib/layout';
import { sectionById } from '@/content/portfolio';
import { materials } from './materials';

export interface Drive {
  /** 0 → 1 as the camera arrives at this summit. */
  open: number;
  hover: number;
}

/** Ignore 3D clicks that actually landed on the HTML overlay. */
export function isUIEvent(e: ThreeEvent<MouseEvent | PointerEvent>) {
  const target = e.nativeEvent.target as Element | null;
  return !!target?.closest?.('.panel, .nav, .rail, .lightbox, button, a');
}

const BEAM_HEIGHT = 90;

/** A mountain top crowned with one portfolio section: a light beam, a gold halo and the floating work. */
export function Summit({
  peak,
  camTarget,
  scale,
  children,
}: {
  peak: (typeof PEAKS)[number];
  camTarget: THREE.Vector3;
  scale: number;
  children: (drive: React.RefObject<Drive>) => ReactNode;
}) {
  const { gold } = materials();
  const section = sectionById[peak.id];
  const drive = useRef<Drive>({ open: 0, hover: 0 });
  const hovered = useRef(false);
  const stage = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const beam = useRef<THREE.MeshBasicMaterial>(null);

  const tex = useMemo(
    () => ({
      beam: verticalTexture([
        [0, 'rgba(255,236,200,0)'],
        [0.7, 'rgba(255,226,180,0.35)'],
        [1, 'rgba(255,240,210,1)'],
      ]),
      glow: radialTexture([
        [0, 'rgba(255,226,170,0.8)'],
        [0.35, 'rgba(255,200,130,0.18)'],
        [1, 'rgba(0,0,0,0)'],
      ]),
    }),
    [],
  );

  useFrame(({ camera, clock }, dt) => {
    dt = Math.min(dt, 0.05);
    const dr = drive.current;
    const near = 1 - smoothstep(4, 30, camera.position.distanceTo(camTarget));
    dr.open = THREE.MathUtils.damp(dr.open, near, 2.4, dt);
    dr.hover = THREE.MathUtils.damp(dr.hover, hovered.current ? 1 : 0, 6, dt);

    const t = clock.elapsedTime;
    if (stage.current) {
      stage.current.position.y = SUMMIT_LIFT + Math.sin(t * 0.8) * 0.15;
      stage.current.scale.setScalar(scale * (0.75 + dr.open * 0.25 + dr.hover * 0.06));
    }
    if (halo.current) halo.current.rotation.z += dt * 0.15;
    if (light.current) light.current.intensity = 18 + dr.open * 50 + dr.hover * 20;
    if (beam.current) beam.current.opacity = 0.55 + Math.sin(t * 1.4 + peak.x) * 0.1 - dr.open * 0.25;
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovered.current = true;
    useUI.getState().setHover(`Explore ${section.name}`);
  };
  const out = () => {
    hovered.current = false;
    useUI.getState().setHover(null);
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (isUIEvent(e)) return;
    e.stopPropagation();
    useUI.getState().setHover(null);
    navigate(`/work/${peak.id}`);
  };

  return (
    <group position={[peak.x, peak.h, peak.z]}>
      {/* Light rising from the summit — echoes the beam above the logo's door */}
      <mesh position-y={BEAM_HEIGHT / 2}>
        <cylinderGeometry args={[0.07, 0.07, BEAM_HEIGHT, 8, 1, true]} />
        <meshBasicMaterial
          ref={beam}
          map={tex.beam}
          color={new THREE.Color(2.6, 2.1, 1.5)}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
        />
      </mesh>

      {/* Gold halo marking the summit */}
      <mesh ref={halo} rotation-x={-Math.PI / 2} position-y={0.6} material={gold}>
        <torusGeometry args={[2.3 * scale, 0.05, 8, 96]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.4}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial map={tex.glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </mesh>

      {/* Events bubble up from any part of the work; children may stop them to handle clicks themselves. */}
      <group ref={stage} position-y={SUMMIT_LIFT} onPointerOver={over} onPointerOut={out} onClick={click}>
        <mesh>
          <sphereGeometry args={[1.6, 16, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>
        {children(drive)}
      </group>

      <pointLight ref={light} position={[0, SUMMIT_LIFT + 4, 5]} color="#ffd29a" intensity={18} distance={22} decay={1.5} />
    </group>
  );
}
