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
  test('renders every artist', async ({ page }) => {
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

    const card = page.locator('[data-artist-card]').filter({ hasText: 'Lea Lindner' });
    await card.locator('[data-artist-open]').first().click();

    const detail = page.locator('[data-artist-detail]');
    await expect(detail).toBeVisible();
    await expect(detail).toContainText('Lea Lindner');
  });

  /* This is the test that was missing. The old ones asked whether the panel was
     visible and whether it held the right name — both true while the sticky
     header covered its top edge and cut the artist's name in half. Being on
     screen and being unobstructed are different questions, and only the second
     one is the promise. Short viewports are where it broke, so it runs at one. */
  test('nothing covers the detail panel, even on a short window', async ({ page }) => {
    await page.setViewportSize({ width: 940, height: 600 });
    await page.goto('/');
    await settled(page);

    for (const name of ['Björn Del Togno', 'Abscure']) {
      await page
        .locator('[data-artist-card]')
        .filter({ hasText: name })
        .locator('[data-artist-open]')
        .click();

      const covered = await page.evaluate(() => {
        const dialog = document.querySelector('[data-artist-detail] [role=dialog]');
        if (!dialog) return 'no dialog';
        const box = dialog.getBoundingClientRect();
        if (box.top < 0) return `panel starts above the viewport at ${Math.round(box.top)}px`;

        // Sample along the top edge: whatever is painted there has to be the panel.
        for (const fraction of [0.15, 0.5, 0.85]) {
          const hit = document.elementFromPoint(box.x + box.width * fraction, box.top + 6);
          if (!dialog.contains(hit)) return `${hit?.tagName} covers the top of the panel`;
        }
        return null;
      });

      expect(covered, `panel for ${name}`).toBeNull();
      await page.keyboard.press('Escape');
    }
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

test.describe('an artist has an address', () => {
  test('opening one changes the URL, closing puts it back', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    await page
      .locator('[data-artist-card]')
      .filter({ hasText: 'Lea Lindner' })
      .locator('[data-artist-open]')
      .click();
    await expect(page).toHaveURL(/\/artists\/lea-lindner\/$/);
    await expect(page).toHaveTitle(/Lea Lindner/);

    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('[data-artist-detail]')).toBeHidden();
  });

  test('the back button closes the panel rather than leaving the site', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    await page.locator('[data-artist-open]').first().click();
    await expect(page.locator('[data-artist-detail]')).toBeVisible();

    await page.goBack();
    await expect(page.locator('[data-artist-detail]')).toBeHidden();
    await expect(page.locator('[data-artist-card]').first()).toBeVisible();
  });

  test('the URL on its own opens that artist, with the roster behind it', async ({ page }) => {
    await page.goto('/artists/bjorn-del-togno');
    await page.waitForLoadState('networkidle');

    const detail = page.locator('[data-artist-detail]');
    await expect(detail).toBeVisible();
    await expect(detail).toContainText('Björn Del Togno');
    // His own words, which is the whole point of the page existing.
    await expect(detail).toContainText('Kufa Saarbrücken');
    await expect(page.locator('[data-artist-card]')).toHaveCount(10);
  });

  test('an id nobody has is the roster, not an error', async ({ page }) => {
    await page.goto('/artists/does-not-exist');
    await page.waitForLoadState('networkidle');
    await settled(page);

    await expect(page.locator('[data-artist-detail]')).toBeHidden();
    await expect(page.locator('[data-artist-card]')).toHaveCount(10);
  });
});

test.describe('sharing an artist', () => {
  test('the button hands out that artist’s own address', async ({ page, context, browserName }) => {
    /* On a phone the button opens the system share sheet, which is what
       "share" means there and cannot be driven headlessly. What is testable is
       the fallback every desktop takes — and the clipboard permission only
       exists in Chromium. */
    test.skip(browserName !== 'chromium', 'no clipboard permission outside Chromium');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.goto('/');
    await settled(page);

    await page
      .locator('[data-artist-card]')
      .filter({ hasText: 'Jona' })
      .locator('[data-artist-open]')
      .click();
    await page.locator('[data-share]').click();

    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toMatch(/\/artists\/jona\/$/);

    // A button that appears to do nothing is worse than no button.
    await expect(page.locator('[data-share]')).toContainText('copied');
  });
});

test.describe('a link with two destinations', () => {
  const openFloVon = async (page: Page) => {
    await page.goto('/');
    await settled(page);
    await page
      .locator('[data-artist-card]')
      .filter({ hasText: 'Flo.Von' })
      .locator('[data-artist-open]')
      .click();
  };

  test('the mark offers both, and Escape closes only the chooser', async ({ page }) => {
    await openFloVon(page);

    // The mark in the row of socials, not the name further down in the note.
    await page.locator('[data-artist-detail] [class*="panelLinks"] button[aria-label="zerrro"]').click();
    const items = page.locator('[role="menuitem"]');
    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toHaveAttribute('href', /instagram\.com/);
    await expect(items.nth(1)).toHaveAttribute('href', /zerrromusic\.com/);

    // Escape belongs to the innermost thing that is open.
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="menu"]')).toHaveCount(0);
    await expect(page.locator('[data-artist-detail]')).toBeVisible();

    /* Closing the chooser hands focus back to its trigger. Send the next key
       only once that has happened, or under load the two Escapes race and this
       test fails for a reason that has nothing to do with the behaviour. */
    await expect(page.locator('[data-artist-detail] p button[aria-label="zerrro"]').first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-artist-detail]')).toBeHidden();
  });

  test('the name in the note offers the same two', async ({ page }) => {
    await openFloVon(page);

    await page
      .locator('[data-artist-detail] section button[aria-label="zerrro"]')
      .scrollIntoViewIfNeeded();
    await page.locator('[data-artist-detail] section button[aria-label="zerrro"]').click();
    await expect(page.locator('[role="menuitem"]')).toHaveCount(2);
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

test.describe('the legal pages', () => {
  /* They are an obligation, so the test is that they exist, that the footer
     reaches them, and that a pasted URL lands on them — which on GitHub Pages
     goes through the 404 fallback rather than a server route. */
  for (const [label, path, marker] of [
    ['impressum', '/impressum', 'Silodom GbR'],
    ['datenschutz', '/datenschutz', 'Verantwortlicher'],
  ] as const) {
    test(`${label} is reachable from the footer and by URL`, async ({ page }) => {
      await page.goto('/');
      await settled(page);

      await page.locator('footer').getByRole('link', { name: label }).click();
      // Trailing slash: the form GitHub Pages serves, so nothing redirects.
      await expect(page).toHaveURL(new RegExp(`${path}/$`));
      await expect(page.locator('main')).toContainText(marker);

      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('main')).toContainText(marker);
    });
  }

  test('the imprint carries what § 5 DDG asks for', async ({ page }) => {
    await page.goto('/impressum');
    await page.waitForLoadState('networkidle');

    const main = page.locator('main');
    await expect(main).toContainText('Silodom GbR');
    await expect(main).toContainText('An der Römerbrücke 3');
    await expect(main).toContainText('66121 Saarbrücken');
    // A contact address that can actually be written to, not a placeholder.
    await expect(main.locator('a[href^="mailto:"]')).toHaveCount(1);
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
