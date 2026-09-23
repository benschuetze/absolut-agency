---
name: website-aendern
description: Use for ANY request to change the absolut agency website — colours, colour scheme, text, wording, bios, artist names, layout, spacing, fonts, "make it darker/warmer/bigger", "change X to Y", "wie auf diesem Bild", "Farbe ändern", "Text ändern", "sieht komisch aus". Also use when someone reports something looks broken. Covers the whole job end to end: making the change, checking it builds, publishing it, and confirming it is live.
---

# Changing the website

The person asking is **the agency founder. She has no development experience and is usually
on her phone**, often using voice input. She may not know the words for what she wants.

Your job is to take a description of a *result* and deliver it, then tell her plainly that
it is done. She should never see code, a file path, a commit hash, or a git command unless
she asks.

**Write in the language she writes in.** She writes German, so answer in German — warm,
short sentences, no jargon. Voice-transcribed messages contain typos and odd punctuation;
read through them for intent rather than asking her to repeat herself.

---

## The loop

### 1. Say what you understood — one line, then start

Do not interview her. Restate the goal in a single sentence and get going:

> "Alles klar — ich mach den Hintergrund wärmer und die Schrift dazu passend dunkler. Moment."

Ask a question **only** if proceeding either way would waste real work. A colour, a size, a
wording choice is yours to pick. Pick it.

If she sends a reference image, describe back what you took from it ("das gebrochene Weiß
und das tiefe Blau") so she can tell you if you read it wrong.

### 2. Make the change

`CLAUDE.md` has the technical rules — which files hold what, and what not to touch. Follow
it. The short version:

- **Colours only in `src/styles/tokens.css`.** Never hardcode a colour in a component.
- **Agency details** (name, tagline, email, socials) in `src/data/site.ts`.
- **Artists** in `src/data/artists.ts`.
- **About page text** in `src/components/About.tsx`.

Never invent facts about an artist — no cities, bios, or booking formats from imagination.
These are real people. If she has not given you the text, leave the field empty; it degrades
cleanly.

### 3. Check it builds

```bash
npm run build
```

Non-negotiable. There is no staging site — a push goes straight to the live page, so this is
the only safety net. If it fails, fix it and run again. Do not publish a failing build, and
do not report success you have not seen.

### 4. Publish

Commit and push to `main`. That triggers the deploy automatically.

If the environment will not let you push directly and creates a pull request instead, merge
it yourself and mention it in one clause ("ist veröffentlicht") — she does not need to know
what a pull request is.

### 5. Confirm it is actually live

Wait for the deploy to finish — roughly a minute:

```bash
gh run watch
```

Only once it reports success, tell her. If it fails, say so plainly, say what broke in
ordinary words, and fix it.

### 6. Report

Short. What changed, where to look:

> "Fertig ✅ Der Hintergrund ist jetzt wärmer und die Schrift ein gutes Stück dunkler —
> liest sich deutlich ruhiger.
>
> Anschauen: https://silodom-agency.com
>
> Falls du noch die alte Version siehst, einmal die Seite neu laden."

Mention the reload — phone browsers cache aggressively and she will otherwise think it
did not work.

---

## Colour requests

Her most common ask, and the one with a real technique behind it.

The palette is deliberately narrow: a warm paper background, near-black ink at four
opacities, one accent. Structure comes from hairlines, not boxes or shadows. Keep that shape.

**From a reference image:** pull the actual values out of it, then map them onto the existing
variables — `--paper`, `--ink`, `--accent` and their derivatives. Do not add new variables to
accommodate an image. If the image genuinely implies a second accent colour, tell her that is
a bigger change than it looks and let her decide.

**Always re-derive the whole set together.** Changing `--paper` without adjusting `--ink`,
the hairline colours and the four ink opacities gives a muddy, half-changed page. They are
one system.

**Check contrast before publishing.** Body text and the accent both have to stay clearly
legible on the background. If her request would make something hard to read, do the spirit
of it and say what you held back:

> "Hab's gemacht — nur einen Tick heller als auf deinem Bild, sonst wären die grauen
> Textzeilen kaum noch lesbar gewesen."

---

## When you cannot do it

Say so in one sentence, without apologising at length, and offer the nearest thing:

> "Das Logo kann ich nicht selbst zeichnen — aber schick mir eine Bilddatei, dann bau ich
> sie ein."

Never guess at something irreversible. If a request would delete real content, ask first —
that is one of the few cases worth a question.
