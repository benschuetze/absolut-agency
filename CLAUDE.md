# Working on this repo

Landing page for **absolut**, a booking and artist management agency. Vite + React +
TypeScript, CSS Modules, no UI dependencies. It builds to static files and deploys to GitHub
Pages automatically on every push to `main`.

**The person asking for changes is usually not a developer.** Read a request as a description
of a result, not as instructions for an implementation. If someone says "make it warmer",
that is a design brief — pick the values yourself, apply them across the token set, and say
what you changed in plain language. Do not ask which hex code they meant.

---

## Where things live

| Want to change | File |
| --- | --- |
| Agency name, tagline, email, socials, city | `src/data/site.ts` |
| The roster — names, cities, bios, tags, photos | `src/data/artists.ts` |
| Colours, type sizes, spacing, motion | `src/styles/tokens.css` |
| About page copy | `src/components/About.tsx` |

Almost every content request is one of those four files. If a request seems to need a fifth,
stop and reconsider — it usually does not.

---

## The colour system

Everything visual derives from `src/styles/tokens.css`. **Change colours there, never in a
component.** A component with a hardcoded colour is a bug.

The palette is deliberately narrow: a warm paper background, near-black ink at four
opacities, and exactly one accent. Structure comes from hairlines, not boxes or shadows.

When asked to match a reference image, pull the actual values out of it and map them onto
`--paper` / `--ink` / `--accent` rather than adding new variables. If a request genuinely
needs a second accent, say so before adding one — two accents is a different design, not a
tweak, and the restraint is the point.

After any colour change, check contrast: body text and the accent both have to stay legible
on the paper background.

---

## Photos

Files go in `src/assets/artists/`, then get imported in `src/data/artists.ts` and assigned to
that artist's `photo` field.

- **4:5 portrait, ~1000 × 1250px, JPG or WebP.** The frame crops with `object-fit: cover`,
  so other ratios get cut off.
- If an image arrives at the wrong ratio, crop it rather than changing the layout. The 4:5
  frame is a design decision, not an accident.
- Until `photo` is set, a seeded halftone placeholder is drawn in the same box. The layout
  does not move when a real photo arrives.

---

## Copy

**All prose on the site is currently lorem ipsum, on purpose.** Real artist names, invented
everything else. Replace it when real copy arrives.

Never write bios, credits, cities or booking formats for an artist from imagination. These
are real people and invented details render as facts. If copy is missing, leave the field
undefined — every field except `id` and `name` is optional and degrades cleanly.

---

## Do not touch unless explicitly asked

- **`vite.config.ts`** — `CUSTOM_DOMAIN` and the base path. The site is served from
  `/absolut-agency/` on GitHub Pages; the base path must match, or every asset 404s.
- **`.github/workflows/deploy.yml`** — working, with two non-obvious constraints already
  solved (see below).
- **`src/lib/router.ts`** — reads `BASE_URL` so links survive the subpath.

Two things look like omissions and are not. Do not "fix" them:

1. **There is no `CNAME` file.** GitHub reads that only for branch-based publishing. With an
   Actions workflow it is ignored.
2. **`configure-pages` has no `enablement: true`.** `GITHUB_TOKEN` may not create a Pages
   site, only deploy to an existing one. Pages was enabled once via the REST API.

---

## Before pushing

```bash
npm run build
```

This runs `tsc` first, so it catches type errors and broken imports before they reach the
live site. A push to `main` deploys within about a minute — there is no staging environment,
so the build is the safety net.

Verify visually where it matters. The roster's hover behaviour (desktop) and its tap-to-
expand behaviour (below 900px) are different code paths; a change to one can silently break
the other.

---

## House style

Match the surrounding code. Sparse comments that explain *why*, never *what*. Real `<button>`
elements so keyboard focus triggers the same states as hover. Every animation must be
disabled under `prefers-reduced-motion` — there is a media query in `tokens.css` that zeroes
the durations, so use the `--dur*` variables rather than hardcoding times.
