import { test, expect, type Page } from '@playwright/test';

/**
 * These tests encode the brief, not the implementation: images have to be on
 * screen the moment the page settles, and every fact about an artist has to be
 * reachable without a hover — because touch and keyboard users never get one.
 */

const ROSTER = [
  'Abscure',
  'Al-Fatmalay',
  'Björn Del Togno',
  'Contrast',
  'Flo.Von',
  'Jona',
  'Kieran Landwehr',
  'Lea Lindner',
  'SDB',
  'Tony Mejeh',
  'vonSchwind',
];

/** Cards animate in on a stagger; settle before asserting on painted pixels. */
async function settled(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.locator('[data-artist-card]').first().waitFor({ state: 'visible' });
  await page.waitForTimeout(1800);
}

test.describe('roster', () => {
  test('renders every artist, Kieran Landwehr included', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    const cards = page.locator('[data-artist-card]');
    await expect(cards).toHaveCount(ROSTER.length);

    for (const name of ROSTER) {
      await expect(
        page.locator('[data-artist-card]').filter({ hasText: name }),
        `card for ${name}`
      ).toHaveCount(1);
    }
  });

  test('artists are listed alphabetically', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    const names = await page.locator('[data-artist-name]').allInnerTexts();
    const normalised = names.map((n) => n.trim());
    expect(normalised).toEqual([...normalised].sort((a, b) => a.localeCompare(b, 'de')));
  });

  /* The whole point of the redesign. */
  test('every artist image is visible on load with no interaction', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    const media = page.locator('[data-artist-media]');
    await expect(media).toHaveCount(ROSTER.length);

    for (let i = 0; i < ROSTER.length; i += 1) {
      const tile = media.nth(i);
      await expect(tile, `media ${i} visible`).toBeVisible();

      const box = await tile.boundingBox();
      expect(box, `media ${i} has a box`).not.toBeNull();
      expect(box!.width, `media ${i} width`).toBeGreaterThan(80);
      expect(box!.height, `media ${i} height`).toBeGreaterThan(80);

      // Visible is not the same as painted — a 0-opacity parent still "shows".
      const opacity = await tile.evaluate((el) => {
        let node: HTMLElement | null = el as HTMLElement;
        let acc = 1;
        while (node) {
          acc *= Number(getComputedStyle(node).opacity);
          node = node.parentElement;
        }
        return acc;
      });
      expect(opacity, `media ${i} effective opacity`).toBeGreaterThan(0.9);
    }
  });

  test('artist names are readable without hovering', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    for (const name of ROSTER) {
      await expect(
        page.locator('[data-artist-name]').filter({ hasText: name }).first()
      ).toBeVisible();
    }
  });

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test('page loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/');
    await settled(page);

    expect(errors).toEqual([]);
  });
});

test.describe('detail access', () => {
  test('opening a card exposes that artist’s detail', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    const card = page.locator('[data-artist-card]').filter({ hasText: 'Kieran Landwehr' });
    await card.locator('[data-artist-open]').first().click();

    const detail = page.locator('[data-artist-detail]');
    await expect(detail).toBeVisible();
    await expect(detail).toContainText('Kieran Landwehr');
  });

  test('detail closes again', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    await page.locator('[data-artist-open]').first().click();
    await expect(page.locator('[data-artist-detail]')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('[data-artist-detail]')).toBeHidden();
  });
});

test.describe('keyboard', () => {
  test('cards are reachable and operable by keyboard', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    const opener = page.locator('[data-artist-open]').first();
    await opener.focus();
    await expect(opener).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(page.locator('[data-artist-detail]')).toBeVisible();
  });

  test('focus reveals the same information hover does', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    const card = page.locator('[data-artist-card]').first();
    await card.locator('[data-artist-open]').first().focus();

    // Whatever the hover mechanism is, focus-within must put the card in the
    // same state — otherwise keyboard users get a different site.
    await expect(card).toHaveAttribute('data-active', 'true');
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('content is present and settled with animation disabled', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(400);

    const media = page.locator('[data-artist-media]');
    await expect(media).toHaveCount(ROSTER.length);
    await expect(media.first()).toBeVisible();

    const opacity = await media
      .first()
      .evaluate((el) => Number(getComputedStyle(el.parentElement ?? el).opacity));
    expect(opacity).toBeGreaterThan(0.9);
  });
});

test.describe('navigation', () => {
  test('about page still renders and links back', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    await page.getByRole('link', { name: /about/i }).click();
    await expect(page.locator('main')).toContainText(/about/i);

    await page.getByRole('link', { name: /artists/i }).first().click();
    await expect(page.locator('[data-artist-card]').first()).toBeVisible();
  });
});
