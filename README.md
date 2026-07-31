# absolut — agency landing page

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

**`src/data/artists.ts`** — the roster. Only `id` and `name` are required; everything else
is optional and degrades cleanly, so entries can be filled in as the information arrives.

```ts
{
  id: 'lea-lindner',     // stable slug, also the artwork seed
  name: 'Lea Lindner',
  city: 'Berlin',        // optional — omitted leaves the meta column empty
  format: 'live',        // optional — 'live' | 'dj' | 'live / dj'
  bio: 'Two or three sentences, no more.',   // optional — falls back to "Bio to follow."
  tags: ['hypnotic', 'modular'],             // optional — three works best
  photo: undefined,      // see below
}
```

The layout adapts to any number of artists — add or remove entries freely. Row numbering,
the roster count and the about-page index all derive from the array.

> **Current state:** the eight names are final. `city`, `format`, `bio` and `tags` are
> deliberately left undefined rather than guessed — these are real people, and invented
> credits would go live looking like facts.

Everything in `site.ts` except the agency name is still placeholder: descriptor, tagline,
city, founding year, email and the social links.

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
import leaLindner from '../assets/artists/lea-lindner.jpg';

{ id: 'lea-lindner', /* … */ photo: leaLindner }
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

Static output. `.github/workflows/deploy.yml` builds on every push to `main` and publishes
to GitHub Pages — no branch to maintain, no `dist/` in git.

Two things make the subpath work, and both are already wired up:

- **`base`** — Pages serves the site at `/<repo>/`, so `vite.config.ts` sets
  `base: '/absolut-agency/'` for production builds only; dev stays at `/`. The router reads
  `import.meta.env.BASE_URL`, so links and the back button follow automatically.
- **`404.html`** — Pages has no SPA rewrite, so a hard load of `/about` would 404. A build
  plugin copies `index.html` to `404.html`; Pages serves that for unmatched paths and the
  router resolves the route on boot.

Renaming the repo means updating the base path in `vite.config.ts` to match.

### Custom domain

Three things, in this order:

1. **DNS**, at the registrar. Apex (`absolut.agency`) needs four A records —
   `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` — and optionally the matching
   AAAA records `2606:50c0:800{0,1,2,3}::153`. A subdomain (`www.absolut.agency`) needs a
   single CNAME to `benschuetze.github.io`. Propagation can take up to 24h.
2. **Tell GitHub**: `gh api -X PUT repos/benschuetze/absolut-agency/pages -f cname=absolut.agency`,
   then enable *Enforce HTTPS* once the certificate is issued (up to 24h).
3. **Set `CUSTOM_DOMAIN`** in `vite.config.ts` and push. A custom domain serves the site
   from `/`, so the base path must change in the same commit — the config derives one from
   the other so it cannot be half-done.

Do **not** add a `CNAME` file to `public/`. GitHub creates and reads that file only for
branch-based publishing; with an Actions workflow it is ignored, and having one around
just misleads whoever looks next.
