import type { ReactNode } from 'react';
import { artists } from '../data/artists';
import styles from './Artwork.module.css';

/* --------------------------------------------------------------------------
   Generative tiles.

   Nine artists, no photography yet — and the roster is now image-first, so all
   nine placeholders are on screen at once at full size. Nine variations of one
   algorithm read as nine copies of the same broken image, so each artist gets a
   different *technique*, not different parameters.

   Two rules hold the set together:

   1. ONE INK BUDGET. Every tile is normalised to the same ink mass, so nine
      unrelated algorithms still print at an even tone across the grid.
   2. MASS IS GEOMETRIC. Coverage is controlled by the size and number of marks,
      never by fading them with opacity — grey ink is what makes generative work
      look cheap. A press changes the dot, not the darkness.

   Colours come from classes only. CSS custom properties do not resolve inside
   SVG presentation attributes: fill="var(--ink)" silently falls back to black,
   which looks right until a tile is inverted and nothing changes.
   -------------------------------------------------------------------------- */

export const VB_W = 400;
export const VB_H = 500;

/** FNV-1a → a stable 32-bit seed, so an artist's tile survives a reload. */
export function seedFrom(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rand = () => number;
const R = (r: Rand, a: number, b: number) => a + r() * (b - a);

/* Every step stays in int32 via Math.imul. With a 64-bit constant the multiply
   exceeds float precision, the bit ops collapse, and this returns exactly 0 at
   every sample — silently, so the tiles still render from their sine terms. */
function hash2(x: number, y: number, s: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function vnoise(x: number, y: number, s: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s);
  const b = hash2(xi + 1, yi, s);
  const c = hash2(xi, yi + 1, s);
  const d = hash2(xi + 1, yi + 1, s);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function fbm(x: number, y: number, s: number, oct = 3): number {
  let t = 0;
  let amp = 0.5;
  let f = 1;
  let norm = 0;
  for (let i = 0; i < oct; i += 1) {
    t += amp * vnoise(x * f, y * f, s + i * 17);
    norm += amp;
    f *= 2;
    amp *= 0.5;
  }
  return t / norm;
}

/** Fraction of the tile covered in ink. The number the whole set is tuned to. */
const TARGET = 0.135;
const budget = (rand: Rand) => TARGET * R(rand, 0.85, 1.15);

/**
 * Stroke techniques hit the budget by solving for line width from the total
 * path length they generated — geometry, not opacity.
 */
function weight(length: number, target: number): number {
  return Math.max(0.55, Math.min(2.4, (target * VB_W * VB_H) / Math.max(1e-6, length)));
}

const dist = (x1: number, y1: number, x2: number, y2: number) => Math.hypot(x2 - x1, y2 - y1);

const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

type Args = { rand: Rand; seed: number; name: string };

/* ---- 1. DITHER — Bayer 8×8 over a mean-shifted field, two paths total ---- */
function dither({ rand, seed }: Args): ReactNode {
  const CELL = 6;
  const cols = Math.ceil(VB_W / CELL);
  const rows = Math.ceil(VB_H / CELL);
  const ang = R(rand, 0, Math.PI * 2);
  const sx = Math.cos(ang);
  const sy = Math.sin(ang);
  const nf = R(rand, 0.55, 1.05);
  const ns = R(rand, 1.6, 2.8);
  const cov = budget(rand);

  const f = new Float64Array(cols * rows);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const u = x / cols;
      const v = y / rows;
      f[y * cols + x] =
        (Math.sin((u * sx + v * sy) * Math.PI * 2 * nf) * 0.5 + 0.5) * 0.62 +
        fbm(u * ns, v * ns * 1.25, seed, 3) * 0.52;
    }
  }

  /* For an ordered dither, coverage *is* the field mean — so shift the mean
     onto the budget and scale contrast around it. Thresholding at a quantile
     would also hit the budget, but it flattens the gradient into a blob. */
  let mean = 0;
  for (let i = 0; i < f.length; i += 1) mean += f[i];
  mean /= f.length;
  const contrast = R(rand, 1.7, 2.6);

  let ink = '';
  let acc = '';
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const lum = cov * 2 + (f[y * cols + x] - mean) * contrast;
      if (lum < (BAYER8[y & 7][x & 7] + 0.5) / 64) continue;
      const d = `M${x * CELL} ${y * CELL}h${CELL}v${CELL}h-${CELL}z`;
      if (lum > 0.62 && lum < 0.72) acc += d;
      else ink += d;
    }
  }

  return (
    <>
      <path className={styles.ink} d={ink} />
      <path className={styles.acc} d={acc} />
    </>
  );
}

/* ---- 2. MOIRÉ — two dashed rings whose interference draws the image ----
   Radius 1000/2π so the dash pattern closes seamlessly. Both rings print at
   full strength; the gap carries the paper. Fading one to 30% is what turned
   this tile lavender in the first pass — a tint of the accent is not the
   accent, and the palette only has room for one. */
function moire({ rand }: Args): ReactNode {
  const r = 159.15;
  const sw = 2 * r;
  const dash = R(rand, 3.4, 4.8);
  const gap = dash * R(rand, 3.4, 4.6);
  const off = R(rand, 5, 12);
  const rot = R(rand, 8, 82);
  const cx = VB_W * R(rand, 0.36, 0.64);
  const cy = VB_H * R(rand, 0.38, 0.62);

  return (
    <g
      transform={`translate(${cx.toFixed(0)} ${cy.toFixed(0)})`}
      fill="none"
      strokeWidth={sw}
      strokeDasharray={`${dash.toFixed(2)} ${gap.toFixed(2)}`}
    >
      <circle className={styles.sInk} r={r} />
      <circle
        className={styles.sAcc}
        r={r}
        cx={off.toFixed(1)}
        cy={off.toFixed(1)}
        transform={`rotate(${rot.toFixed(1)})`}
      />
    </g>
  );
}

/* ---- 3. CONTOUR — stacked noise-displaced polylines ---- */
function contour({ rand, seed }: Args): ReactNode {
  const N = Math.round(R(rand, 34, 50));
  const amp = R(rand, 55, 120);
  const ns = R(rand, 1.6, 3.2);
  const accI = Math.floor(R(rand, 3, N - 3));

  const paths: ReactNode[] = [];
  let mass = 0;
  for (let i = 0; i < N; i += 1) {
    const t = i / (N - 1);
    let d = '';
    let px = 0;
    let py = 0;
    for (let x = 0; x <= VB_W; x += 8) {
      const u = x / VB_W;
      const y = t * VB_H * 1.06 - 30 + (fbm(u * ns, t * ns * 2.2, seed, 3) - 0.5) * amp * (0.5 + t * 0.9);
      if (x) mass += dist(px, py, x, y) * 1.15;
      d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
      px = x;
      py = y;
    }
    const isAcc = i === accI || i === accI + 1;
    paths.push(
      <path
        key={i}
        className={isAcc ? styles.sAcc : styles.sInk}
        d={d}
        fill="none"
        strokeWidth={isAcc ? 2.2 : undefined}
      />
    );
  }

  return <g strokeWidth={weight(mass, budget(rand)).toFixed(2)}>{paths}</g>;
}

/* ---- 4. FLOW FIELD ---- */
function flow({ rand, seed }: Args): ReactNode {
  const N = Math.round(R(rand, 150, 210));
  const STEPS = Math.round(R(rand, 34, 56));
  const STEP = 7;
  const ns = R(rand, 2.4, 4.6);
  const turns = R(rand, 2.4, 4.2);

  const paths: ReactNode[] = [];
  let mass = 0;
  for (let i = 0; i < N; i += 1) {
    let x = R(rand, -30, VB_W + 30);
    let y = R(rand, -30, VB_H + 30);
    let d = `M${x.toFixed(0)} ${y.toFixed(0)}`;
    let k = 0;
    for (let s = 0; s < STEPS; s += 1) {
      const a = fbm((x / VB_W) * ns, (y / VB_H) * ns, seed, 3) * Math.PI * turns;
      x += Math.cos(a) * STEP;
      y += Math.sin(a) * STEP;
      if (x < -40 || x > VB_W + 40 || y < -40 || y > VB_H + 40) break;
      d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
      k += 1;
    }
    if (k < 6) continue;
    const isAcc = rand() < 0.07;
    mass += k * STEP;
    paths.push(
      <path
        key={i}
        className={isAcc ? styles.sAcc : styles.sInk}
        d={d}
        fill="none"
        strokeWidth={isAcc ? 1.9 : undefined}
        strokeLinecap="round"
      />
    );
  }

  return <g strokeWidth={weight(mass, budget(rand)).toFixed(2)}>{paths}</g>;
}

/* ---- 5. SPECTRO — per-column energy bins. A techno agency gets a plot. ---- */
function spectro({ rand, seed }: Args): ReactNode {
  const cols = Math.round(R(rand, 30, 44));
  const rows = Math.round(R(rand, 40, 56));
  const cw = VB_W / cols;
  const rh = VB_H / rows;
  const gx = cw * 0.32;
  const gy = rh * 0.32;
  const ns = R(rand, 2.4, 4);
  const decay = R(rand, 0.6, 1.1);
  const cov = budget(rand) * 1.7;

  const env = new Float64Array(cols);
  for (let c = 0; c < cols; c += 1) {
    env[c] = Math.pow(Math.max(0, fbm(((c + 0.5) / cols) * ns, 0.37, seed, 3)), decay);
  }

  /* Bar height is column energy; bisect for the scale that spends the budget. */
  let lo = 0;
  let hi = 1;
  for (let it = 0; it < 24; it += 1) {
    const m = (lo + hi) / 2;
    let lit = 0;
    for (let c = 0; c < cols; c += 1) {
      lit += Math.min(rows, Math.round((env[c] / Math.max(1e-6, m)) * rows * 0.5));
    }
    if (lit / (cols * rows) > cov) lo = m;
    else hi = m;
  }
  const k = (lo + hi) / 2;

  let ink = '';
  let acc = '';
  for (let c = 0; c < cols; c += 1) {
    const lit = Math.min(rows, Math.round((env[c] / Math.max(1e-6, k)) * rows * 0.5));
    for (let r = 0; r < lit; r += 1) {
      const yy = VB_H - (r + 1) * rh;
      const d = `M${(c * cw + gx / 2).toFixed(1)} ${(yy + gy / 2).toFixed(1)}h${(cw - gx).toFixed(1)}v${(rh - gy).toFixed(1)}h-${(cw - gx).toFixed(1)}z`;
      if (r === lit - 1) acc += d;
      else ink += d;
    }
  }

  return (
    <>
      <path className={styles.ink} d={ink} />
      <path className={styles.acc} d={acc} />
    </>
  );
}

/* ---- 6. GLYPH MOSAIC — a density ramp typed out in the mono face ---- */
const RAMP = '..::--==++**##%%@@';

function glyphs({ rand, seed }: Args): ReactNode {
  const cols = Math.round(R(rand, 26, 34));
  const rows = Math.floor(VB_H / (VB_W / cols / 0.6));
  const ch = VB_H / rows;
  const ns = R(rand, 2.2, 3.8);
  const ox = R(rand, 0, 40);
  const oy = R(rand, 0, 40);

  const lines: ReactNode[] = [];
  for (let r = 0; r < rows; r += 1) {
    let line = '';
    for (let c = 0; c < cols; c += 1) {
      const n = fbm((c / cols) * ns + ox, (r / rows) * ns * 1.2 + oy, seed, 3);
      const g = (n - 0.28) * 2.3;
      line += g <= 0.02 ? ' ' : RAMP[Math.min(RAMP.length - 1, Math.floor(g * RAMP.length))];
    }
    lines.push(
      <text key={r} className={styles.ink} x="0" y={((r + 0.8) * ch).toFixed(1)}>
        {line}
      </text>
    );
  }

  return (
    <g className={styles.mono} fontSize={ch.toFixed(1)} xmlSpace="preserve">
      {lines}
    </g>
  );
}

/* ---- 7. RINGS ---- */
function rings({ rand }: Args): ReactNode {
  const N = Math.round(R(rand, 30, 50));
  const cx = VB_W * R(rand, 0.25, 0.75);
  const cy = VB_H * R(rand, 0.25, 0.75);
  const maxR = R(rand, 320, 520);
  const g = R(rand, 0.65, 1.5);
  const accI = Math.floor(R(rand, 4, N - 4));
  const sq = R(rand, 0.72, 1);
  const dashed = rand() < 0.5;

  const shapes: ReactNode[] = [];
  let mass = 0;
  for (let i = 0; i < N; i += 1) {
    const r = Math.pow((i + 1) / N, g) * maxR;
    const isAcc = i === accI || i === accI + 1;
    mass +=
      Math.PI * (r + r * sq) * (dashed && !isAcc ? 0.67 : 1) * Math.min(1, (VB_W * 0.62) / Math.max(1, r));
    shapes.push(
      <ellipse
        key={i}
        className={isAcc ? styles.sAcc : styles.sInk}
        cx={cx.toFixed(0)}
        cy={cy.toFixed(0)}
        rx={(r * sq).toFixed(1)}
        ry={r.toFixed(1)}
        fill="none"
        strokeWidth={isAcc ? 2.8 : undefined}
        strokeDasharray={dashed && !isAcc ? `${(r * 0.1).toFixed(1)} ${(r * 0.05).toFixed(1)}` : undefined}
      />
    );
  }

  return <g strokeWidth={weight(mass, budget(rand)).toFixed(2)}>{shapes}</g>;
}

/* ---- 8. TYPE — the name is the image ---- */
function typo({ rand, name }: Args): ReactNode {
  const up = name.toUpperCase().replace(/[^A-ZÀ-Þ0-9.]/g, '');
  const N = Math.round(R(rand, 6, 10));
  const rot = R(rand, -4, 4);
  const accI = Math.floor(R(rand, 1, N - 1));
  const fs = (VB_H / N) * 1.22;

  const lines: ReactNode[] = [];
  for (let i = 0; i < N; i += 1) {
    const isAcc = i === accI;
    lines.push(
      <text
        key={i}
        className={isAcc ? styles.acc : styles.tOut}
        x={(-R(rand, 10, 120)).toFixed(0)}
        y={((i + 0.86) * (VB_H / N)).toFixed(0)}
      >
        {`${up} ${up} ${up}`}
      </text>
    );
  }

  return (
    <g
      className={styles.disp}
      transform={`rotate(${rot.toFixed(1)} 200 250)`}
      fontSize={fs.toFixed(0)}
    >
      {lines}
    </g>
  );
}

/* ---- 9. SCAN — CRT interference bands ---- */
function scan({ rand, seed }: Args): ReactNode {
  const N = Math.round(R(rand, 70, 110));
  const f = R(rand, 1.2, 3);
  const ph = R(rand, 0, 6.28);
  const ns = R(rand, 2, 4);

  const lines: ReactNode[] = [];
  let mass = 0;
  for (let i = 0; i < N; i += 1) {
    const v = (i + 0.5) / N;
    const y = v * VB_H;
    let amp = (Math.sin(v * Math.PI * 2 * f + ph) * 0.5 + 0.5) * 0.55 + fbm(v * ns, 0.5, seed, 2) * 0.75;
    amp = Math.max(0, Math.min(1, (amp - 0.3) * 2)); // gamma → real light and dark bands
    if (amp < 0.06) continue;
    const x0 = (fbm(v * 5, 9, seed, 2) - 0.5) * 70;
    const isAcc = amp > 0.985; // the accent stays a hairline, never a band
    const sy = 0.35 + amp * 1.4;
    mass += (VB_W - 2 * x0) * sy;
    lines.push(
      <line
        key={i}
        className={isAcc ? styles.sAcc : styles.sInk}
        x1={x0.toFixed(0)}
        y1={y.toFixed(1)}
        x2={(VB_W - x0).toFixed(0)}
        y2={y.toFixed(1)}
        transform={`scale(1 ${sy.toFixed(2)}) translate(0 ${(y / sy - y).toFixed(2)})`}
      />
    );
  }

  return <g strokeWidth={weight(mass, budget(rand)).toFixed(2)}>{lines}</g>;
}

const TECHNIQUES = { dither, contour, spectro, flow, glyphs, rings, scan, typo, moire } as const;

export type Technique = keyof typeof TECHNIQUES;

/** Fixed order, so an assignment sweep hands out every technique before repeating. */
export const ORDER: Technique[] = [
  'dither',
  'contour',
  'spectro',
  'flow',
  'glyphs',
  'rings',
  'scan',
  'typo',
  'moire',
];

/**
 * Which technique each artist gets.
 *
 * Hashing the id alone collapses to six techniques with three duplicated, and a
 * duplicate is exactly what the grid must not show. So take each artist's
 * hashed preference in turn and give them the next free technique from there —
 * deterministic, and every technique is spent before any repeats.
 */
export function assignTechniques(ids: string[]): Map<string, Technique> {
  const out = new Map<string, Technique>();
  const taken = new Set<Technique>();

  for (const id of ids) {
    if (taken.size === ORDER.length) taken.clear();
    const start = seedFrom(id) % ORDER.length;
    for (let k = 0; k < ORDER.length; k += 1) {
      const technique = ORDER[(start + k) % ORDER.length];
      if (taken.has(technique)) continue;
      taken.add(technique);
      out.set(id, technique);
      break;
    }
  }

  return out;
}

/**
 * A third of the tiles print in negative — paper marks on ink ground.
 *
 * This is not decoration. A photograph brings its own ground, and a dark
 * portrait dropped into an all-light grid punches a hole in it. Establishing a
 * dark family *before* the photos arrive means the first real portrait joins an
 * existing part of the system instead of breaking one.
 */
export function isNegative(id: string): boolean {
  return mulberry32(seedFrom(`neg:${id}`))() < 0.34;
}

/* Which technique goes to whom is a property of the roster as a whole, not of
   one artist, so it is resolved once here rather than threaded through props. */
const ASSIGNED = assignTechniques(artists.map((a) => a.id));

export function techniqueFor(id: string): Technique {
  return ASSIGNED.get(id) ?? ORDER[seedFrom(id) % ORDER.length];
}

export function renderTile(technique: Technique, id: string, name: string): ReactNode {
  const seed = seedFrom(id);
  return TECHNIQUES[technique]({ rand: mulberry32(seed), seed, name });
}
