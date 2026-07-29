# Artist photos

Drop artist photography here, then import it in `src/data/artists.ts` and assign it to that
artist's `photo` field.

- **Aspect ratio:** 4:5 (portrait). The frame crops with `object-fit: cover`, so anything
  else will be cut.
- **Size:** ~1000 × 1250 is plenty — the largest rendered box is 244px wide.
- **Format:** JPG or WebP. Vite fingerprints and copies them at build time.

Until a `photo` is set, `components/Artwork.tsx` draws a seeded halftone placeholder in the
same box, so the layout does not shift when the real image arrives.
