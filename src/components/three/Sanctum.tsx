'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { archBand } from '@/lib/shapes';
import { grainTexture, mandalaTexture, radialTexture, starFloorTexture } from '@/lib/textures';

const ARCADE_X = 11;
const ARCADE_Z = [8, 15, 22, 29, 36, 43, 50];
const MANDALA_SIZE = 36;
const MANDALA_INNER = 9.6;

/** The approach to the Hidden Gate: an arcade with lanterns, a star-inlaid floor, sacred geometry and a carried light. */
export function Sanctum({ quality }: { quality: 'high' | 'low' }) {
  return (
    <group>
      <Arcade />
      <StarFloor />
      <Mandala />
      {quality === 'high' && <CursorLight />}
    </group>
  );
}

function Arcade() {
  const lanterns = useRef<THREE.InstancedMesh>(null);
  const { arch, plinth, bronze, lanternMat } = useMemo(() => {
    const grain = grainTexture(256, 11);
    grain.repeat.set(0.4, 0.4);
    return {
      arch: new THREE.ExtrudeGeometry(archBand(3.4, 5.6, 2.8, 0.26), {
        depth: 0.32,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.04,
        bevelSegments: 2,
        curveSegments: 24,
      }).translate(0, 0, -0.16),
      plinth: new THREE.BoxGeometry(4.2, 0.3, 0.9),
      bronze: new THREE.MeshStandardMaterial({ color: '#8a6a3e', metalness: 1, roughness: 0.48, roughnessMap: grain, bumpMap: grain }),
      lanternMat: new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 3.6, 2), toneMapped: false }),
    };
  }, []);

  const placements = useMemo(() => ARCADE_Z.flatMap((z) => [-1, 1].map((side) => ({ x: side * ARCADE_X, z, side }))), []);
  const mat = useMemo(() => new THREE.Matrix4(), []);

  useFrame(({ clock }) => {
    const m = lanterns.current;
    if (!m) return;
    const t = clock.elapsedTime;
    placements.forEach((p, i) => {
      const flicker = 1 + Math.sin(t * 3.1 + i * 1.7) * 0.08 + Math.sin(t * 7.3 + i) * 0.04;
      mat.makeScale(flicker, flicker, flicker).setPosition(p.x, 5.1 + Math.sin(t * 0.8 + i) * 0.05, p.z);
      m.setMatrixAt(i, mat);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {placements.map((p) => (
        <group key={`${p.side}${p.z}`} position={[p.x, 0, p.z]} rotation-y={Math.PI / 2}>
          <mesh geometry={arch} material={bronze} position-y={0.3} />
          <mesh geometry={plinth} material={bronze} position-y={0.15} />
        </group>
      ))}
      <instancedMesh ref={lanterns} args={[undefined, undefined, placements.length]} material={lanternMat}>
        <sphereGeometry args={[0.13, 12, 12]} />
      </instancedMesh>
    </group>
  );
}

function StarFloor() {
  const tex = useMemo(() => starFloorTexture(), []);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.opacity = 0.32 + Math.sin(clock.elapsedTime * 0.7) * 0.05;
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, 24.5]}>
      <planeGeometry args={[24, 48]} />
      <meshBasicMaterial
        ref={mat}
        map={tex}
        color={new THREE.Color(1.3, 1.05, 0.7)}
        transparent
        opacity={0.32}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

function Mandala() {
  const tex = useMemo(() => mandalaTexture(MANDALA_INNER / (MANDALA_SIZE / 2)), []);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.012;
  });
  return (
    <mesh ref={ref} position={[0, 7.2, 0.005]}>
      <planeGeometry args={[MANDALA_SIZE, MANDALA_SIZE]} />
      <meshBasicMaterial
        map={tex}
        color={new THREE.Color(0.85, 0.65, 0.38)}
        transparent
        opacity={0.28}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/** A warm light that follows the pointer across the floor before the door. */
function CursorLight() {
  const light = useRef<THREE.PointLight>(null);
  const glow = useRef<THREE.Mesh>(null);
  const tools = useMemo(
    () => ({
      ray: new THREE.Raycaster(),
      floor: new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
      hit: new THREE.Vector3(),
      at: new THREE.Vector3(0, 0, 20),
      tex: radialTexture([
        [0, 'rgba(255,214,150,0.7)'],
        [0.4, 'rgba(255,190,120,0.15)'],
        [1, 'rgba(0,0,0,0)'],
      ]),
    }),
    [],
  );

  useFrame(({ pointer, camera }, dt) => {
    const { ray, floor, hit, at } = tools;
    const active = camera.position.z > 6 ? 1 : 0;
    ray.setFromCamera(pointer, camera);
    if (ray.ray.intersectPlane(floor, hit) && hit.z > 1 && hit.z < camera.position.z) {
      hit.x = THREE.MathUtils.clamp(hit.x, -14, 14);
      at.lerp(hit, 1 - Math.exp(-8 * dt));
    }
    if (light.current) {
      light.current.position.set(at.x, 1.4, at.z);
      light.current.intensity = THREE.MathUtils.damp(light.current.intensity, active * 26, 4, dt);
    }
    if (glow.current) {
      glow.current.position.set(at.x, 0.02, at.z);
      (glow.current.material as THREE.MeshBasicMaterial).opacity = (light.current?.intensity ?? 0) / 26 * 0.55;
    }
  });

  return (
    <>
      <pointLight ref={light} color="#ffcf90" intensity={0} distance={13} decay={1.6} />
      <mesh ref={glow} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[7, 7]} />
        <meshBasicMaterial map={tools.tex} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </>
  );
}
