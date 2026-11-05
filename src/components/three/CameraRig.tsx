'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { journey, maxScroll, STOPS } from '@/lib/journey';
import { smoothstep } from '@/lib/noise';
import { useUI } from '@/lib/store';
import type { Layout } from '@/lib/layout';
import { HAZE } from './Beyond';

const easeInOut = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const BLACK = new THREE.Color('#050403');

/** Drives the camera along the keyframed journey from scroll position, with mouse parallax and an intro dolly. */
export function CameraRig({ layout }: { layout: Layout }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const scene = useThree((s) => s.scene);
  const s = useRef({ t: 0, px: 0, py: 0, intro: 0, ready: false });
  const pos = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector3());

  // One smooth curve per segment, threading any `via` waypoints of the destination stop.
  const paths = useMemo(
    () =>
      STOPS.slice(1).map((id, i) => {
        const a = layout.cams[STOPS[i]];
        const b = layout.cams[id];
        return new THREE.CatmullRomCurve3([a.pos, ...(b.via ?? []), b.pos], false, 'centripetal');
      }),
    [layout],
  );

  useFrame((state, dt) => {
    const st = s.current;
    dt = Math.min(dt, 0.05);
    const target = journey.previewT ?? window.scrollY / maxScroll();
    st.t = st.ready ? THREE.MathUtils.damp(st.t, target, 7, dt) : target;
    st.ready = true;

    // Locate the keyframe segment for the current progress.
    const t = st.t;
    let i = 0;
    while (i < STOPS.length - 2 && t > journey.stopT[STOPS[i + 1]]) i++;
    const a = STOPS[i];
    const b = STOPS[i + 1];
    const ta = journey.stopT[a];
    const tb = journey.stopT[b];
    const u = easeInOut(THREE.MathUtils.clamp((t - ta) / Math.max(1e-4, tb - ta), 0, 1));
    paths[i].getPoint(u, pos.current);
    look.current.lerpVectors(layout.cams[a].look, layout.cams[b].look, u);

    // Intro: drift in from further back once loading finishes.
    if (useUI.getState().loaded) st.intro = THREE.MathUtils.damp(st.intro, 1, 1.4, dt);
    const back = (1 - st.intro) * 18;
    pos.current.z += back;
    pos.current.y += (1 - st.intro) * 2;

    // Parallax — gentler while passing through the narrow door.
    const nearDoor = 1 - smoothstep(0, 5, Math.abs(pos.current.z));
    st.px = THREE.MathUtils.damp(st.px, state.pointer.x, 3, dt);
    st.py = THREE.MathUtils.damp(st.py, state.pointer.y, 3, dt);
    const k = 1 - nearDoor * 0.85;
    pos.current.x += st.px * 0.45 * k;
    pos.current.y += st.py * 0.25 * k;
    look.current.x += st.px * 1.1 * k;
    look.current.y += st.py * 0.6 * k;

    camera.position.copy(pos.current);
    camera.lookAt(look.current);
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __cam: THREE.Camera }).__cam = camera;

    const fov = layout.mobile ? 58 : 45;
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    // Darkness before the door, luminous haze beyond it.
    const beyond = smoothstep(1, -8, camera.position.z);
    const fog = scene.fog as THREE.Fog | null;
    if (fog) {
      fog.color.copy(BLACK).lerp(HAZE, beyond);
      fog.near = THREE.MathUtils.lerp(30, 24, beyond);
      fog.far = THREE.MathUtils.lerp(120, 220, beyond);
    }
  });

  return null;
}
