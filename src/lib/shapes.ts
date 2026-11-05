import * as THREE from 'three';

/**
 * The NIHĀN arch: straight jambs rising to an ogee (onion) point.
 * Points run from bottom-right, up and over the tip, down to bottom-left.
 */
export function archPoints(w: number, h: number, top: number, divisions = 28) {
  const hw = w / 2;
  const p = new THREE.Path();
  p.moveTo(hw, 0);
  p.lineTo(hw, h);
  p.bezierCurveTo(hw, h + top * 0.55, hw * 0.12, h + top * 0.55, 0, h + top);
  p.bezierCurveTo(-hw * 0.12, h + top * 0.55, -hw, h + top * 0.55, -hw, h);
  p.lineTo(-hw, 0);
  return p.getPoints(divisions);
}

/** An arch-shaped band (∩), open at the bottom — the gold frames of the logo. */
export function archBand(w: number, h: number, top: number, thickness: number) {
  const outer = archPoints(w, h, top);
  const inner = archPoints(w - thickness * 2, h, top - thickness * 1.1).reverse();
  return new THREE.Shape([...outer, ...inner]);
}

export function archShape(w: number, h: number, top: number) {
  return new THREE.Shape(archPoints(w, h, top));
}

export function archHole(w: number, h: number, top: number) {
  return new THREE.Path(archPoints(w, h, top));
}

/** One leaf of a double door filling an arch; `side` 1 = right leaf, -1 = left. Hinge sits at x = 0. */
export function doorLeaf(w: number, h: number, top: number, side: 1 | -1) {
  const hw = w / 2;
  // Built in the arch's own frame, then shifted so the hinge (outer jamb) is the origin.
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(side * hw, 0),
    new THREE.Vector2(side * hw, h),
  ];
  const curve = new THREE.CubicBezierCurve(
    new THREE.Vector2(side * hw, h),
    new THREE.Vector2(side * hw, h + top * 0.55),
    new THREE.Vector2(side * hw * 0.12, h + top * 0.55),
    new THREE.Vector2(0, h + top),
  );
  pts.push(...curve.getPoints(20).slice(1));
  return new THREE.Shape(pts.map((p) => new THREE.Vector2(p.x - side * hw, p.y)));
}

/** Tapered crescent between angles a0 → a1 (radians), thickest in the middle. */
export function crescent(R: number, thick: number, a0: number, a1: number, n = 80) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push(new THREE.Vector2(Math.cos(a) * R, Math.sin(a) * R));
  }
  for (let i = n; i >= 0; i--) {
    const t = i / n;
    const a = a0 + (a1 - a0) * t;
    const r = R - thick * Math.pow(Math.sin(Math.PI * t), 0.9);
    pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  return new THREE.Shape(pts);
}

export const deg = (d: number) => (d * Math.PI) / 180;
