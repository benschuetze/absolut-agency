# SUBSTRAT — agency landing page

A two-page landing page for an electronic music booking agency. No backend, no CMS:
everything is a typed constant in `src/data/`, and the whole thing builds to static files.

**Stack:** Vite + React 18 + TypeScript, CSS Modules, zero UI dependencies.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # → dist/
npm run preview    # serve the production build
npm run typecheck
```

---

## The two tabs

| Route     | View                    | Behaviour                                                                                                                                                             |
| --------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`       | `components/Artists.tsx` | Roster as a hairline row list. **≥900px:** hovering a name dims the rest of the list and cross-fades that artist's image + bio into the sticky panel on the right. **<900px:** tapping a row expands it inline. |
| `/about`  | `components/About.tsx`   | Editorial: lead statement, two-column copy, services, facts and contact.                                                                                               |

Routing is 40 lines in `src/lib/router.ts` — History API plus the View Transitions API for
the tab swap where the browser supports it. Two pages did not justify a router dependency.

---

## Editing content

Everything a non-developer would want to change lives in two files.

**`src/data/site.ts`** — agency name, descriptor, tagline, city, email, socials. The name is
used in the wordmark, `<title>`, footer and about copy, so renaming the agency is a one-line
change.

**`src/data/artists.ts`** — the roster. Each entry:

```ts
{
  id: 'arc-lumen',       // stable slug, also the artwork seed
  name: 'Arc Lumen',
  city: 'Berlin',
  format: 'live',        // 'live' | 'dj' | 'live / dj'
  bio: 'Two or three sentences, no more.',
  tags: ['hypnotic', 'modular'],
  photo: undefined,      // see below
}
```

The layout adapts to any number of artists — add or remove entries freely. Row numbering,
the roster count and the about-page index all derive from the array.

> The current roster is **placeholder copy**: invented names, cities and bios. Replace it.

---

## Photos

There are no photos yet, so `components/Artwork.tsx` draws a **seeded duotone halftone** at
the exact final proportions (4:5) instead of a grey box. Each artist's `id` seeds a
deterministic field, so every artist has their own composition and it never changes between
reloads. Panels carry a small `IMAGE PENDING` label at large sizes.

To drop real photos in:

1. Put the files in `src/assets/artists/` (4:5 crop, ~1000×1250, JPG or WebP).
2. Import and assign in `src/data/artists.ts`:

```ts
import arcLumen from '../assets/artists/arc-lumen.jpg';

{ id: 'arc-lumen', /* … */ photo: arcLumen }
```

`Artwork` renders the photo instead and the generative fallback disappears. Nothing else
moves — the placeholder already reserves the final box.

---

## Design system

All of it is in `src/styles/tokens.css`. Change the six colour variables and the site
changes mood without touching a component.

- **Surface** — warm limestone `#e8e5de`, not white. Two soft airbrush washes drift behind
  the content and a fine SVG grain sits on top, so the paper never reads as an empty div.
- **Ink** `#111216`, used at four opacities. Structure comes from hairlines, not boxes.
- **Accent** `#2333e0`, deliberately rationed: row indices, hover states, links, and a thin
  band inside the placeholder artwork.
- **Type** — Archivo Variable for display, JetBrains Mono Variable for every label, index,
  meta line and the footer clock. Both self-hosted via `@fontsource-variable`, so there is
  no external font request. Sizes are fluid `clamp()`; the stage headline uses container
  query units so it fits its column rather than the viewport.
- **Motion** — one shared easing (`--ease`) and three durations. Every animation is disabled
  under `prefers-reduced-motion`.

## Accessibility notes

Rows are real `<button>`s, so the hover preview also fires on keyboard focus and the dimming
respects `:focus-within`. On mobile they carry `aria-expanded` / `aria-controls`. The sticky
preview panel is `aria-hidden` because it duplicates content already in the list. Focus rings
are visible and the accent passes contrast on the paper background.

## Deploying

Static output — `npm run build` then serve `dist/` from anywhere (Netlify, Vercel, Pages,
plain nginx). One thing to configure: the SPA fallback, so `/about` returns `index.html`
rather than a 404.
