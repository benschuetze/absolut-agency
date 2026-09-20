/**
 * Visual capture harness — not a test.
 *
 * Drives the running dev server through a set of viewports and interaction
 * states and writes PNGs, so the result can actually be looked at rather than
 * only asserted about. Run against an already-running dev server:
 *
 *   node tests/shoot.mjs [baseURL] [outDir]
 */
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:5173';
const OUT = process.argv[3] ?? 'tests/__screenshots__';

mkdirSync(OUT, { recursive: true });

/** Load-in animations are staggered; wait past the longest before shooting. */
const SETTLE = 2200;

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'tablet-820', width: 820, height: 1180 },
];

const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(SETTLE);
  await page.screenshot({ path: `${OUT}/${vp.name}-load.png` });
  await page.screenshot({ path: `${OUT}/${vp.name}-full.png`, fullPage: true });

  // Hover the second card, so the reveal state is captured next to a resting one.
  const cards = page.locator('[data-artist-card]');
  if ((await cards.count()) > 1) {
    await cards.nth(1).hover();
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/${vp.name}-hover.png` });
  }

  // Keyboard parity: tab to the first card and shoot the focus state.
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(SETTLE);
  for (let i = 0; i < 6; i += 1) await page.keyboard.press('Tab');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${vp.name}-focus.png` });

  await page.goto(`${BASE}/about`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/${vp.name}-about.png`, fullPage: true });

  await ctx.close();
  console.log(`shot ${vp.name}`);
}

// Touch device — no hover, so this is the state most likely to be wrong.
const phone = await browser.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 2 });
const p = await phone.newPage();
await p.goto(BASE, { waitUntil: 'networkidle' });
await p.waitForTimeout(SETTLE);
await p.screenshot({ path: `${OUT}/mobile-load.png` });
await p.screenshot({ path: `${OUT}/mobile-full.png`, fullPage: true });

const firstCard = p.locator('[data-artist-card]').first();
if (await firstCard.count()) {
  await firstCard.tap();
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}/mobile-tapped.png` });
}
await phone.close();
console.log('shot mobile');

// Reduced motion — everything should be settled and legible with no animation.
const rm = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
  deviceScaleFactor: 2,
});
const rp = await rm.newPage();
await rp.goto(BASE, { waitUntil: 'networkidle' });
await rp.waitForTimeout(1200);
await rp.screenshot({ path: `${OUT}/desktop-reduced-motion.png` });
await rm.close();
console.log('shot reduced-motion');

await browser.close();
console.log(`\nScreenshots written to ${OUT}`);
