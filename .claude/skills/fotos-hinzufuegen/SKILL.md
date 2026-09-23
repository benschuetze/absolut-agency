---
name: fotos-hinzufuegen
description: Use when adding, replacing or removing artist photos on the absolut website — "hier sind die Fotos", "Bild von SDB einfügen", "das Foto austauschen", "Foto ist falsch rum", an image attached with an artist's name, or any request involving artist photography. Handles the 4:5 crop requirement, file placement, wiring the photo to the right artist, and publishing.
---

# Adding artist photos

Photos are the most common thing to go wrong, because they arrive in whatever shape a phone
or a photographer produced them in. The frame on the site is **4:5 portrait**, and it crops
with `object-fit: cover` — anything wider gets its sides cut off, anything taller loses top
and bottom.

Handle that for her. Do not send her away to crop something.

---

## What to do

### 1. Work out which artist

If she attached an image without saying who it is, ask — that is worth a question, because
guessing puts the wrong face next to a real person's name.

The roster is in `src/data/artists.ts`. Match loosely: "Björn", "der Björn", "del togno" all
mean the same entry.

### 2. Get the file into the repo

Save to `src/assets/artists/<artist-id>.jpg`, using the artist's existing `id` as the
filename — `bjorn-del-togno.jpg`, `lea-lindner.jpg`, `p-vonschwind.jpg`.

**Crop to 4:5 yourself** if the source is a different ratio. Keep the subject's face in
frame; crop toward the top of a portrait rather than the centre, since heads sit high.
Target roughly 1000 × 1250px. If the file is very large, compress it — a landing page should
not ship a 12MB photo.

Tell her in one clause if you cropped ("hab's auf Hochformat zugeschnitten"), so a surprising
crop is not a mystery later.

### 3. Wire it up

Import it in `src/data/artists.ts` and set the `photo` field:

```ts
import bjornDelTogno from '../assets/artists/bjorn-del-togno.jpg';

{ id: 'bjorn-del-togno', /* … */ photo: bjornDelTogno }
```

The generated placeholder pattern disappears on its own once `photo` is set, and the layout
does not shift — the placeholder already occupies the final box.

### 4. Build, publish, confirm

```bash
npm run build
```

Then commit, push, and wait for the deploy with `gh run watch`. Only report success after it
has actually finished.

### 5. Report

> "Björns Foto ist drin ✅ Ich hab's auf Hochformat zugeschnitten, damit es in den Rahmen
> passt.
>
> Anschauen: https://silodom-agency.com — einmal neu laden, falls du noch
> das alte Muster siehst."

---

## Notes

**If she cannot attach the file**, she can upload it through GitHub in a browser — into
`src/assets/artists/` — and then tell you it is there. Walk her through it in plain steps
only if she asks.

**Removing a photo:** delete the `photo` field. The generated placeholder comes back
automatically, so the page never shows a hole.

**Several photos at once** is fine and normal. Do them all, then build and publish once
rather than deploying six times.
