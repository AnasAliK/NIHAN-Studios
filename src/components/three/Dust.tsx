'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

const vert = /* glsl */ `
  uniform float uTime;
  uniform float uPixel;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.18 + aSeed * 6.283) * 0.7;
    p.x += cos(uTime * 0.13 + aSeed * 12.0) * 0.5;
    p.z += sin(uTime * 0.1 + aSeed * 3.0) * 0.4;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = min((1.5 + aSeed * 3.5) * uPixel * (18.0 / -mv.z), 5.0 * uPixel);
    gl_Position = projectionMatrix * mv;
    vAlpha = (0.25 + 0.75 * abs(sin(uTime * 0.6 + aSeed * 40.0))) * smoothstep(70.0, 6.0, -mv.z) * smoothstep(0.5, 2.5, -mv.z);
  }
`;

const frag = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(1.6, 1.25, 0.85) * a * vAlpha, a * vAlpha);
  }
`;

/** Floating motes of light along the whole journey. */
export function Dust({ count }: { count: number }) {
  const dpr = useThree((s) => s.viewport.dpr);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 38;
      pos[i * 3 + 2] = 50 - Math.random() * 230;
      seed[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixel: { value: 1 } }), []);

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.elapsedTime;
    uniforms.uPixel.value = dpr;
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
