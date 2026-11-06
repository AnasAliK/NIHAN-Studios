'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { ridged, noise2, smoothstep } from '@/lib/noise';
import { radialTexture, verticalTexture, rockTexture } from '@/lib/textures';
import { PEAKS } from '@/lib/layout';

/** Colours of the world beyond the door (logo: sepia mountains in luminous mist). */
export const HAZE = new THREE.Color('#c3ab82');
const ROCK_DARK = new THREE.Color('#282620');
const ROCK_LIGHT = new THREE.Color('#c4ab80');
const ROCK_LAYER = new THREE.Color('#786b56');
const LIGHT_DIR = new THREE.Vector3(-0.45, 0.75, 0.35).normalize();

const SKY_Z = -385;

/** One featured summit: a steep cone with rocky shoulders and a clean tip at exactly `h`. */
function peak(x: number, z: number, p: (typeof PEAKS)[number]) {
  const r = 18 + p.h * 0.5;
  const dist = Math.hypot(x - p.x, z - p.z);
  if (dist >= r) return 0;
  // Sharp, slightly concave profile with jagged ridges on the flanks; the very tip stays clean.
  const k = 1 - dist / r;
  const cone = k * k * (1.6 - 0.6 * k);
  // Broad ribs read clearly at both mesh resolutions; avoid noisy needle-like flanks.
  const angle = Math.atan2(z - p.z, x - p.x);
  const ribs = Math.cos(angle * 5 + p.x * 0.12 + dist * 0.045) * 0.12;
  const rock = ((ridged(x * 0.075 + p.x, z * 0.075 + p.z, 4) - 0.32) * 0.95 + ribs) * p.h;
  const flank = smoothstep(0.02, 0.25, 1 - k) * (1 - smoothstep(0.6, 1, 1 - k));
  return p.h * cone + rock * flank * cone;
}

/** Terrain: a broad basin holding the four portfolio peaks, ringed by ranges rising toward the sun. */
function height(x: number, z: number) {
  const d = -z;
  if (d < 0) return -0.15;
  const basin = 30 + d * 0.12;
  const near = smoothstep(basin, basin + 22 + d * 0.12, Math.abs(x));
  const far = smoothstep(200, 330, d) * 0.7;
  const mask = Math.max(near, far);
  // Ranges grow with distance but stay below the sun on the horizon.
  const ranges = ridged(x * 0.022 + 3.1, z * 0.022 - 1.7, 5) * (8 + Math.min(d, 150) * 0.42);
  const ground = (noise2(x * 0.15, z * 0.15) - 0.5) * 0.35 + (noise2(x * 0.03, z * 0.03) - 0.5) * 2.4 * smoothstep(5, 30, d);
  let h = -0.15 + ground * (1 - mask) + mask * ranges;
  for (const p of PEAKS) h = Math.max(h, peak(x, z, p));
  return h;
}

const terrainVert = /* glsl */ `
  varying vec3 vRockPosition;
  varying vec3 vRockWeights;
  varying vec3 vColor;
  varying float vDist;
  varying float vH;
  void main() {
    vRockPosition = position * 0.18;
    vec3 weights = pow(abs(normal), vec3(4.0));
    vRockWeights = weights / max(dot(weights, vec3(1.0)), 0.0001);
    vColor = color;
    vH = position.y;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const terrainFrag = /* glsl */ `
  uniform sampler2D uRock;
  varying vec3 vRockPosition;
  varying vec3 vRockWeights;
  uniform vec3 uHaze;
  uniform float uDensity;
  varying vec3 vColor;
  varying float vDist;
  varying float vH;
  void main() {
    float f = 1.0 - exp(-vDist * uDensity);
    f += (1.0 - smoothstep(0.0, 22.0, vH)) * 0.28 * smoothstep(8.0, 70.0, vDist);
    // Three planar projections keep the fine detail from stretching on steep cliffs.
    float rock = dot(vec3(
      texture2D(uRock, vRockPosition.yz).r,
      texture2D(uRock, vRockPosition.xz).r,
      texture2D(uRock, vRockPosition.xy).r
    ), vRockWeights);
    float detail = smoothstep(0.0, 4.0, vH) * (1.0 - smoothstep(90.0, 240.0, vDist));
    vec3 stone = vColor * (1.0 + (rock - 0.5) * 1.25 * detail);
    gl_FragColor = vec4(mix(stone, uHaze, clamp(f, 0.0, 1.0)), 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function Beyond({ quality }: { quality: 'high' | 'low' }) {
  const terrain = useMemo(() => {
    const segX = quality === 'high' ? 360 : 190;
    const segZ = quality === 'high' ? 260 : 140;
    const geo = new THREE.PlaneGeometry(700, 384, segX, segZ);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, -192.4);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)));
    geo.computeVertexNormals();

    const nrm = geo.attributes.normal as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const n = new THREE.Vector3();
    const c = new THREE.Color();
    const stride = segX + 1;
    for (let i = 0; i < pos.count; i++) {
      n.fromBufferAttribute(nrm, i);
      const y = pos.getY(i);
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const lit = Math.pow(Math.max(0, n.dot(LIGHT_DIR)), 1.4);
      c.copy(ROCK_DARK).lerp(ROCK_LIGHT, lit * 0.85 + smoothstep(10, 70, y) * 0.25);
      // Bake strata and local crevice shading into existing vertex colors.
      // These broad color variations complement the finer surface texture.
      const mineral = noise2(x * 0.13 + 17, z * 0.13 - 9);
      const grain = noise2(x * 0.32 + y * 0.09, z * 0.32 - y * 0.06);
      const rockMask = smoothstep(0.5, 5, y);
      const slope = 1 - smoothstep(0.65, 0.95, n.y);
      // Warped sediment bands and mineral patches, sampled at mesh-scale frequencies.
      const strata = 0.5 + 0.5 * Math.sin(y * 0.85 + x * 0.07 + z * 0.045 + mineral * 2.8);
      const seam = smoothstep(0.68, 0.94, strata);
      c.lerp(ROCK_LAYER, (strata * 0.22 + mineral * 0.12) * slope * rockMask);
      c.multiplyScalar(1 + ((grain - 0.5) * 0.24 + (mineral - 0.5) * 0.18 - seam * slope * 0.14) * rockMask);
      const col = i % stride;
      if (col > 0 && col < segX && i >= stride && i < pos.count - stride) {
        const surrounding = (pos.getY(i - 1) + pos.getY(i + 1) + pos.getY(i - stride) + pos.getY(i + stride)) * 0.25;
        const relief = (y - surrounding) / (700 / segX);
        c.multiplyScalar(1 - smoothstep(0, 0.8, -relief) * 0.2 + smoothstep(0, 0.65, relief) * 0.08);
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.ShaderMaterial({
      vertexShader: terrainVert,
      fragmentShader: terrainFrag,
      vertexColors: true,
      uniforms: { uHaze: { value: HAZE.clone() }, uDensity: { value: 0.005 }, uRock: { value: rockTexture() } },
    });
    return { geo, mat };
  }, [quality]);

  const tex = useMemo(
    () => ({
      sky: verticalTexture([
        [0, '#0c0907'],
        [0.38, '#3a2f22'],
        [0.66, '#bfa77d'],
        [0.8, '#f1e2bc'],
        [1, '#d9c49c'],
      ]),
      sun: radialTexture([
        [0, 'rgba(255,246,225,1)'],
        [0.12, 'rgba(255,236,200,0.55)'],
        [0.4, 'rgba(255,214,160,0.12)'],
        [1, 'rgba(0,0,0,0)'],
      ]),
      mist: verticalTexture([
        [0, 'rgba(255,255,255,0)'],
        [0.6, 'rgba(255,255,255,0.45)'],
        [1, 'rgba(255,255,255,0.9)'],
      ]),
    }),
    [],
  );

  const mists = [-28, -66, -100, -136, -190, -260];

  return (
    <group>
      <mesh geometry={terrain.geo} material={terrain.mat} />

      {/* Sky — only ever seen through the door or from beyond it */}
      <mesh position={[0, 230, SKY_Z]}>
        <planeGeometry args={[2200, 1000]} />
        <meshBasicMaterial map={tex.sky} color={new THREE.Color(1.05, 1.05, 1.05)} fog={false} toneMapped={false} />
      </mesh>

      {/* Sun */}
      <mesh position={[0, 62, SKY_Z + 5]}>
        <circleGeometry args={[7, 48]} />
        <meshBasicMaterial color={new THREE.Color(6, 5.2, 3.8)} fog={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, 62, SKY_Z + 8]}>
        <planeGeometry args={[190, 190]} />
        <meshBasicMaterial
          map={tex.sun}
          color={new THREE.Color(1.6, 1.4, 1.1)}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
          toneMapped={false}
        />
      </mesh>

      {/* Layered mist between ridges */}
      {mists.map((z, i) => (
        <mesh key={z} position={[0, 3 + i * 2.2, z]}>
          <planeGeometry args={[620, 14 + i * 6]} />
          <meshBasicMaterial map={tex.mist} color={HAZE} transparent opacity={0.3} depthWrite={false} fog={false} />
        </mesh>
      ))}

      <directionalLight position={[-20, 40, -10]} intensity={1.4} color="#ffe2b5" />
      <hemisphereLight args={['#e8d6b0', '#1a140e', 0.35]} />
    </group>
  );
}
