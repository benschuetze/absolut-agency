/* Ad-hoc sanity check for the new generative tiles — opens every mobile
   accordion row in turn and screenshots the thumbnail. Not part of the suite. */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] ?? 'http://localhost:5173';
const OUT = 'tests/__tiles__';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 3400 } });
await page.setViewportSize({ width: 420, height: 3400 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

const rows = page.locator('[class*="row"] button[class*="trigger"]');
const count = await rows.count();
console.log(`rows: ${count}`);
for (let i = 0; i < count; i += 1) {
  await rows.nth(i).click();
  await page.waitForTimeout(450);
  const art = page.locator('li[data-open] [class*="detailArt"]').first();
  await art.screenshot({ path: `${OUT}/tile-${i}.png` });
  await rows.nth(i).click();
  await page.waitForTimeout(250);
}
await browser.close();
console.log('done');
