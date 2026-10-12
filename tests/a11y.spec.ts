import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * axe on every kind of page the site has. Serious and critical findings fail
 * the run; the rest are worth reading but are not blockers.
 */
async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length}×)`)).toEqual([]);
}

async function settled(page: Page) {
  await page.waitForLoadState('networkidle');
  // Cards fade in on a stagger; contrast is measured on what is finally painted.
  await page.waitForTimeout(1800);
}

for (const [label, path] of [
  ['roster', '/'],
  ['about', '/about'],
  ['an artist with the panel open', '/artists/lea-lindner/'],
  ['imprint', '/impressum/'],
  ['privacy notice', '/datenschutz/'],
] as const) {
  test(`accessibility: ${label}`, async ({ page }) => {
    await page.goto(path);
    await settled(page);
    await expectNoSeriousViolations(page);
  });
}

test.describe('hover', () => {
  test('hovering a card marks only that card, and dims nothing else', async ({ page, isMobile }) => {
    test.skip(isMobile, 'touch has no hover');
    await page.goto('/');
    await settled(page);
    const cards = page.locator('[data-artist-card]');
    await cards.nth(1).hover();
    await expect(cards.nth(1)).toHaveAttribute('data-active', 'true');
    const others = await cards.evaluateAll((els) =>
      els.filter((_, i) => i !== 1).map((el) => Number(getComputedStyle(el).opacity)),
    );
    expect(others.every((o) => o === 1)).toBe(true);
  });
});

test.describe('tabs', () => {
  test('artists → about → artists, with the address and the active tab following', async ({ page }) => {
    await page.goto('/');
    await settled(page);
    await page.getByRole('link', { name: /about/i }).first().click();
    await expect(page).toHaveURL(/\/about\/?$/);
    await page.getByRole('link', { name: /artists/i }).first().click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-artist-card]').first()).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/about\/?$/);
  });
});
