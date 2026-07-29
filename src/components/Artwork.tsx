import { useMemo } from 'react';
import styles from './Artwork.module.css';

/* FNV-1a → a stable 32-bit seed per artist, so every artist always gets the
   same artwork across reloads. */
function seedFrom(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(h ^ input.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLS = 19;
const ROWS = 24;
const VB_W = 400;
const VB_H = 500;

type Dot = { cx: number; cy: number; r: number; accent: boolean };

/**
 * Placeholder artwork: a seeded duotone halftone field.
 *
 * The brief has no photography yet, so rather than blocking the space with a
 * grey rectangle every artist gets a distinct, deterministic composition at the
 * exact final proportions (4:5). Swap in a real photo via `photo` and this
 * disappears — the layout does not move.
 */
export function Artwork({ id, name, photo }: { id: string; name: string; photo?: string }) {
  const { dots, initials } = useMemo(() => {
    const rand = mulberry32(seedFrom(id));

    // Seeded parameters for a cheap smooth field. Frequencies are kept low on
    // purpose: high ones read as noise, low ones read as a halftoned photograph.
    const fx = 0.5 + rand() * 1.1;
    const fy = 0.45 + rand() * 0.95;
    const fd = 0.6 + rand() * 1.2;
    const p1 = rand() * Math.PI * 2;
    const p2 = rand() * Math.PI * 2;
    const p3 = rand() * Math.PI * 2;
    const tilt = rand() * Math.PI * 2;
    const accentBand = 0.34 + rand() * 0.26;

    const cellW = VB_W / COLS;
    const cellH = VB_H / ROWS;
    const maxR = Math.min(cellW, cellH) * 0.54;

    const out: Dot[] = [];
    for (let row = 0; row < ROWS; row += 1) {
      for (let col = 0; col < COLS; col += 1) {
        const u = (col + 0.5) / COLS;
        const v = (row + 0.5) / ROWS;

        const field =
          Math.sin(u * fx * Math.PI * 2 + p1) * Math.cos(v * fy * Math.PI * 2 + p2) +
          Math.sin((u * Math.cos(tilt) + v * Math.sin(tilt)) * fd * Math.PI * 2 + p3);

        // Directional falloff — a light source, so the field has a top and a bottom.
        const gradient = 1 - (u * 0.4 + v * 0.85) * 0.95;
        const amount = Math.max(0, Math.min(1, (field / 2 + 0.5) * 0.66 + gradient * 0.42));

        if (amount < 0.1) continue;

        out.push({
          cx: (col + 0.5) * cellW,
          cy: (row + 0.5) * cellH,
          r: +(amount * maxR).toFixed(2),
          accent: amount > accentBand && amount < accentBand + 0.11,
        });
      }
    }

    // Roster names are not all "First Last" — SDB, P.VonSchwind, Flo.Von. Reading
    // the capitals out of the name handles those; anything else falls back to the
    // first two characters.
    const capitals = name.replace(/[^A-ZÀ-Þ]/g, '');
    const letters = (capitals.length >= 2 ? capitals : name).slice(0, 2).toUpperCase();

    return { dots: out, initials: letters };
  }, [id, name]);

  if (photo) {
    return (
      <div className={styles.frame}>
        <img className={styles.photo} src={photo} alt={name} loading="lazy" decoding="async" />
      </div>
    );
  }

  return (
    <div className={styles.frame}>
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`Placeholder artwork for ${name}`}
      >
        <defs>
          <linearGradient id={`wash-${id}`} x1="0" y1="0" x2="0.7" y2="1">
            <stop offset="0%" className={styles.washTop} />
            <stop offset="100%" className={styles.washBottom} />
          </linearGradient>
        </defs>

        <rect width={VB_W} height={VB_H} className={styles.ground} />
        <rect width={VB_W} height={VB_H} fill={`url(#wash-${id})`} />

        <g className={styles.grid}>
          {Array.from({ length: 4 }, (_, i) => (
            <line key={`v${i}`} x1={((i + 1) * VB_W) / 5} y1="0" x2={((i + 1) * VB_W) / 5} y2={VB_H} />
          ))}
          {Array.from({ length: 5 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={((i + 1) * VB_H) / 6} x2={VB_W} y2={((i + 1) * VB_H) / 6} />
          ))}
        </g>

        <g>
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.cx}
              cy={d.cy}
              r={d.r}
              className={d.accent ? styles.dotAccent : styles.dot}
            />
          ))}
        </g>

        <text
          className={styles.initials}
          x={VB_W / 2}
          y={VB_H / 2}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {initials}
        </text>
      </svg>

      <span className={`u-mono ${styles.badge}`}>image pending</span>
    </div>
  );
}
