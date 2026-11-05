'use client';

import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Lightformer, PresentationControls, Sparkles } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { sectionById, type SectionId } from '@/content/portfolio';
import type { Drive } from './Summit';
import { NeuralCore } from './installations/NeuralCore';
import { DeviceFan } from './installations/DeviceFan';
import { GameRing } from './installations/GameRing';
import { BrowserStack } from './installations/BrowserStack';

const INSTALLATIONS = { ai: NeuralCore, apps: DeviceFan, games: GameRing, web: BrowserStack };

/** Halo of gold rings behind the piece, echoing the summit halos in the main journey. */
function Halo() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (a.current) a.current.rotation.z += dt * 0.08;
    if (b.current) b.current.rotation.z -= dt * 0.05;
  });
  return (
    <group position-z={-1.6}>
      <mesh ref={a}>
        <torusGeometry args={[2.9, 0.012, 8, 160]} />
        <meshBasicMaterial color={new THREE.Color(1.6, 1.2, 0.7)} toneMapped={false} />
      </mesh>
      <mesh ref={b}>
        <torusGeometry args={[3.25, 0.006, 8, 160]} />
        <meshBasicMaterial color={new THREE.Color(1.1, 0.85, 0.5)} toneMapped={false} />
      </mesh>
    </group>
  );
}

function HoverDriver({ drive, hovered }: { drive: React.RefObject<Drive>; hovered: React.RefObject<boolean> }) {
  useFrame((_, dt) => {
    drive.current.hover = THREE.MathUtils.damp(drive.current.hover, hovered.current ? 1 : 0, 5, dt);
  });
  return null;
}

/** Interactive 3D hero for a section page: drag to turn the piece, hover to wake it. */
export default function SectionScene({ id }: { id: SectionId }) {
  const drive = useRef<Drive>({ open: 1, hover: 0 });
  const hovered = useRef(false);
  const Installation = INSTALLATIONS[id];

  return (
    <Canvas
      className="section-scene"
      dpr={[1, 2]}
      flat
      gl={{ antialias: false, alpha: true }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      camera={{ position: [0, 0, 11], fov: 38 }}
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
    >
      <Environment resolution={256} frames={1} environmentIntensity={0.7}>
        <Lightformer form="rect" intensity={2.4} color="#ffd9a6" position={[0, 4, 8]} scale={[10, 4, 1]} />
        <Lightformer form="ring" intensity={3} color="#ffe7c2" position={[4, 2, -4]} scale={4} />
        <Lightformer form="rect" intensity={0.9} color="#a37a45" position={[-8, 0, 2]} rotation-y={Math.PI / 2} scale={[12, 6, 1]} />
      </Environment>
      <pointLight position={[2.5, 3, 4]} intensity={45} color="#ffd29a" decay={1.6} />
      <pointLight position={[-3, -2, 3]} intensity={12} color="#c9a36a" decay={1.6} />
      <HoverDriver drive={drive} hovered={hovered} />

      <Suspense fallback={null}>
        <PresentationControls global={false} cursor snap polar={[-0.35, 0.35]} azimuth={[-0.9, 0.9]} speed={1.4}>
          <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.5}>
            <group scale={1.15}>
              <Installation drive={drive} section={sectionById[id]} />
            </group>
          </Float>
        </PresentationControls>
      </Suspense>
      <Halo />
      <Sparkles count={70} scale={[9, 6, 4]} size={2.2} speed={0.25} opacity={0.8} color="#f0d9a8" />

      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.9} luminanceSmoothing={0.25} radius={0.75} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
