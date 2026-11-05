'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { AdaptiveDpr, Environment, Lightformer, PerformanceMonitor, useProgress } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { getLayout, PEAKS } from '@/lib/layout';
import { useUI } from '@/lib/store';
import { sectionById } from '@/content/portfolio';
import { Gate } from './Gate';
import { Beyond } from './Beyond';
import { Dust } from './Dust';
import { CameraRig } from './CameraRig';
import { Summit } from './Summit';
import { Sanctum } from './Sanctum';
import { NeuralCore } from './installations/NeuralCore';
import { DeviceFan } from './installations/DeviceFan';
import { GameRing } from './installations/GameRing';
import { BrowserStack } from './installations/BrowserStack';

const INSTALLATIONS = { ai: NeuralCore, apps: DeviceFan, games: GameRing, web: BrowserStack };

function useIsMobile() {
  const size = useThree((s) => s.size);
  return size.width < 768 || size.width / size.height < 0.8;
}

function World({ quality }: { quality: 'high' | 'low' }) {
  const mobile = useIsMobile();
  const layout = useMemo(() => getLayout(mobile), [mobile]);

  return (
    <>
      <CameraRig layout={layout} />
      <Gate quality={quality} />
      <Sanctum quality={quality} />
      <Beyond quality={quality} />
      <Dust count={quality === 'high' ? 3600 : 1400} />
      {PEAKS.map((p) => {
        const Installation = INSTALLATIONS[p.id];
        return (
          <Suspense key={p.id} fallback={null}>
            <Summit peak={p} camTarget={layout.cams[p.id].pos} scale={layout.summitScale}>
              {(drive) => <Installation drive={drive} section={sectionById[p.id]} />}
            </Summit>
          </Suspense>
        );
      })}
    </>
  );
}

/** Reveal the gate after its first frames, independently of the portfolio textures. */
function Ready() {
  const setLoaded = useUI((s) => s.setLoaded);
  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(setLoaded);
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [setLoaded]);
  return null;
}

/** Writes load progress straight to the loader bar (subscribing avoids re-rendering during Suspense). */
function ProgressBridge() {
  useEffect(
    () =>
      useProgress.subscribe(({ progress }) => {
        const bar = document.getElementById('loader-progress');
        if (bar) bar.style.transform = `scaleX(${progress / 100})`;
      }),
    [],
  );
  return null;
}

export default function Experience() {
  const [quality, setQuality] = useState<'high' | 'low'>(() =>
    typeof window !== 'undefined' && (window.innerWidth < 768 || matchMedia('(pointer: coarse)').matches) ? 'low' : 'high',
  );

  return (
    <Canvas
      className="scene"
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      eventPrefix="client"
      dpr={[1, quality === 'high' ? 2 : 1.5]}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 45, near: 0.1, far: 1200, position: [0, 4.6, 60] }}
      flat
      onCreated={({ scene }) => {
        scene.background = new THREE.Color('#050403');
        scene.fog = new THREE.Fog('#050403', 30, 120);
      }}
    >
      <PerformanceMonitor onDecline={() => setQuality('low')} />
      <AdaptiveDpr pixelated={false} />
      <ProgressBridge />

      {/* Warm studio reflections for the gold */}
      <Environment resolution={256} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={2.4} color="#ffd9a6" position={[0, 6, 12]} scale={[14, 5, 1]} />
        <Lightformer form="ring" intensity={4} color="#ffe7c2" position={[0, 5, -6]} scale={5} />
        <Lightformer form="rect" intensity={0.8} color="#a37a45" position={[-12, 3, 2]} rotation-y={Math.PI / 2} scale={[20, 6, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#a37a45" position={[12, 3, 2]} rotation-y={-Math.PI / 2} scale={[20, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#fff1d6" position={[0, 14, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
      </Environment>

      <Suspense fallback={null}>
        <World quality={quality} />
        <Ready />
      </Suspense>

      <EffectComposer multisampling={quality === 'high' ? 4 : 0}>
        <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.9} luminanceSmoothing={0.25} radius={0.78} />
        <Vignette offset={0.22} darkness={0.72} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
