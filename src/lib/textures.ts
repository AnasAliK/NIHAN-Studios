import * as THREE from 'three';

type Stop = [number, string];

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

export function radialTexture(stops: Stop[], size = 256) {
  const [c, x] = canvas(size, size);
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Top → bottom gradient (stop 0 = top of the texture). */
export function verticalTexture(stops: Stop[], height = 512) {
  const [c, x] = canvas(4, height);
  const g = x.createLinearGradient(0, 0, 0, height);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  x.fillStyle = g;
  x.fillRect(0, 0, 4, height);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Grainy, mottled grey map used as roughness + bump for hammered metal and stone. */
export function grainTexture(size = 512, seed = 1) {
  const [c, x] = canvas(size, size);
  let s = seed * 9301 + 49297;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  x.fillStyle = '#8a8a8a';
  x.fillRect(0, 0, size, size);
  for (let i = 0; i < 70; i++) {
    const r = 20 + rand() * 90;
    const px = rand() * size;
    const py = rand() * size;
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    const v = rand() > 0.5 ? 255 : 0;
    g.addColorStop(0, `rgba(${v},${v},${v},0.09)`);
    g.addColorStop(1, `rgba(${v},${v},${v},0)`);
    x.fillStyle = g;
    x.fillRect(px - r, py - r, r * 2, r * 2);
  }
  for (let i = 0; i < 16000; i++) {
    const v = (90 + rand() * 120) | 0;
    x.fillStyle = `rgba(${v},${v},${v},${0.15 + rand() * 0.45})`;
    const r = 0.6 + rand() * 1.8;
    x.fillRect(rand() * size, rand() * size, r, r);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/**
 * Inlaid floor of eight-pointed stars (khatam) in gold line-work.
 * Fades toward the far end and the sides so it reads as a path leading to the door.
 */
export function starFloorTexture() {
  const W = 1024;
  const H = 2048;
  const [c, x] = canvas(W, H);
  const cell = W / 12;
  x.strokeStyle = 'rgba(232,200,140,0.9)';
  x.lineWidth = 2;
  for (let gy = 0; gy <= H / cell; gy++) {
    for (let gx = 0; gx <= 12; gx++) {
      const cx = gx * cell;
      const cy = gy * cell;
      const r = cell * 0.42;
      // two overlapping squares = eight-pointed star
      for (const rot of [0, Math.PI / 4]) {
        x.beginPath();
        for (let k = 0; k < 4; k++) {
          const a = rot + (k * Math.PI) / 2 + Math.PI / 4;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          if (k === 0) x.moveTo(px, py);
          else x.lineTo(px, py);
        }
        x.closePath();
        x.stroke();
      }
      // small cross-shaped joints between stars
      x.beginPath();
      x.moveTo(cx + cell * 0.42, cy);
      x.lineTo(cx + cell * 0.58, cy);
      x.moveTo(cx, cy + cell * 0.42);
      x.lineTo(cx, cy + cell * 0.58);
      x.stroke();
    }
  }
  // Fade: bright along the centre line near the door (texture top), dissolving toward the edges and far end.
  x.globalCompositeOperation = 'destination-in';
  const v = x.createLinearGradient(0, 0, 0, H);
  v.addColorStop(0, 'rgba(0,0,0,1)');
  v.addColorStop(0.55, 'rgba(0,0,0,0.45)');
  v.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = v;
  x.fillRect(0, 0, W, H);
  const h = x.createLinearGradient(0, 0, W, 0);
  h.addColorStop(0, 'rgba(0,0,0,0)');
  h.addColorStop(0.3, 'rgba(0,0,0,1)');
  h.addColorStop(0.7, 'rgba(0,0,0,1)');
  h.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = h;
  x.fillRect(0, 0, W, H);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Ring of sacred geometry framing the gate; the centre is left empty for the crescents. */
export function mandalaTexture(innerRatio: number) {
  const S = 2048;
  const [c, x] = canvas(S, S);
  const C = S / 2;
  const R = S / 2;
  x.translate(C, C);
  x.strokeStyle = 'rgba(232,200,140,1)';
  const ring = (r: number, w: number) => {
    x.lineWidth = w;
    x.beginPath();
    x.arc(0, 0, r * R, 0, Math.PI * 2);
    x.stroke();
  };
  const star = (n: number, step: number, r: number, rot: number, w: number) => {
    x.lineWidth = w;
    x.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = rot + ((i * step) % n) * ((Math.PI * 2) / n);
      const px = Math.cos(a) * r * R;
      const py = Math.sin(a) * r * R;
      if (i === 0) x.moveTo(px, py);
      else x.lineTo(px, py);
    }
    x.stroke();
  };
  ring(innerRatio, 2);
  ring(innerRatio + 0.03, 1);
  star(24, 5, 0.8, 0, 1.6);
  star(24, 5, 0.8, Math.PI / 24, 1);
  ring(0.8, 2);
  ring(0.86, 1);
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * Math.PI * 2;
    const r0 = i % 4 === 0 ? 0.86 : 0.88;
    x.lineWidth = i % 4 === 0 ? 2 : 1;
    x.beginPath();
    x.moveTo(Math.cos(a) * r0 * R, Math.sin(a) * r0 * R);
    x.lineTo(Math.cos(a) * 0.92 * R, Math.sin(a) * 0.92 * R);
    x.stroke();
  }
  ring(0.92, 1.5);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + Math.PI / 24;
    x.beginPath();
    x.arc(Math.cos(a) * 0.96 * R, Math.sin(a) * 0.96 * R, 6, 0, Math.PI * 2);
    x.fillStyle = 'rgba(232,200,140,1)';
    x.fill();
  }
  ring(0.995, 1);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Procedural website mock-up drawn in gold line-work, used when no web project images exist. */
export function websiteTexture(variant: number) {
  const W = 1024;
  const H = 650;
  const [c, x] = canvas(W, H);
  const gold = '#d8b878';
  const dim = 'rgba(216,184,120,0.35)';
  x.fillStyle = 'rgba(14,11,8,0.88)';
  x.beginPath();
  x.roundRect(4, 4, W - 8, H - 8, 22);
  x.fill();
  x.strokeStyle = gold;
  x.lineWidth = 3;
  x.stroke();
  // window chrome
  x.fillStyle = 'rgba(216,184,120,0.08)';
  x.fillRect(6, 6, W - 12, 52);
  [34, 62, 90].forEach((cx) => {
    x.beginPath();
    x.arc(cx, 32, 8, 0, Math.PI * 2);
    x.strokeStyle = dim;
    x.stroke();
  });
  x.strokeStyle = dim;
  x.beginPath();
  x.roundRect(300, 18, 420, 28, 14);
  x.stroke();
  x.strokeStyle = gold;
  x.fillStyle = gold;
  x.lineWidth = 2;

  if (variant === 0) {
    // landing page
    x.font = '600 26px Georgia, serif';
    x.fillText('NIHĀN', 48, 112);
    [560, 660, 760, 860].forEach((px) => x.fillRect(px, 100, 60, 4));
    x.font = '500 64px Georgia, serif';
    x.fillText('Beyond the', 48, 250);
    x.fillText('known.', 48, 326);
    x.fillStyle = dim;
    [380, 404, 428].forEach((py, i) => x.fillRect(48, py, 380 - i * 70, 6));
    x.strokeStyle = gold;
    x.beginPath();
    x.roundRect(48, 470, 200, 56, 28);
    x.stroke();
    // hero arch
    x.beginPath();
    x.moveTo(640, 600);
    x.lineTo(640, 330);
    x.bezierCurveTo(640, 240, 760, 240, 770, 150);
    x.bezierCurveTo(780, 240, 900, 240, 900, 330);
    x.lineTo(900, 600);
    x.stroke();
    const g = x.createLinearGradient(0, 260, 0, 600);
    g.addColorStop(0, 'rgba(255,220,160,0.7)');
    g.addColorStop(1, 'rgba(255,220,160,0.05)');
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(740, 600);
    x.lineTo(740, 380);
    x.bezierCurveTo(740, 330, 765, 330, 770, 280);
    x.bezierCurveTo(775, 330, 800, 330, 800, 380);
    x.lineTo(800, 600);
    x.fill();
  } else if (variant === 1) {
    // dashboard grid
    x.strokeStyle = dim;
    x.strokeRect(30, 80, 200, 540);
    [120, 170, 220, 270, 320].forEach((py) => x.fillRect(56, py, 140, 5));
    for (let r = 0; r < 2; r++)
      for (let k = 0; k < 3; k++) {
        x.strokeStyle = gold;
        x.beginPath();
        x.roundRect(260 + k * 248, 80 + r * 140, 228, 120, 12);
        x.stroke();
      }
    x.strokeStyle = gold;
    x.beginPath();
    x.roundRect(260, 370, 724, 250, 12);
    x.stroke();
    x.beginPath();
    for (let i = 0; i <= 24; i++) {
      const px = 290 + i * 28;
      const py = 560 - (Math.sin(i * 0.6) * 0.5 + 0.5) * 120 - i * 3;
      if (i === 0) x.moveTo(px, py);
      else x.lineTo(px, py);
    }
    x.stroke();
  } else {
    // code view
    x.font = '22px Consolas, monospace';
    const lines = [
      ['<', 'Gate', ' open={true}>'],
      ['  <', 'World', ' hidden />'],
      ['  <', 'Light', ' search="understanding" />'],
      ['</', 'Gate', '>'],
      [''],
      ['const ', 'beyond', ' = await threshold();'],
      ['beyond.', 'reveal', '();'],
    ];
    lines.forEach((parts, i) => {
      let px = 48;
      parts.forEach((p, j) => {
        x.fillStyle = j === 1 ? gold : dim;
        x.fillText(p, px, 120 + i * 46);
        px += x.measureText(p).width;
      });
    });
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
