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
  /* Cards are links, not buttons. Without this a crawler finds the artist
     pages only through the sitemap, and they inherit nothing from the roster
     that links to them. */
  test('the roster links to every artist', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    const hrefs = await page.$$eval('[data-artist-open]', (els) =>
      els.map((a) => a.getAttribute('href'))
    );
    expect(hrefs).toHaveLength(10);
    for (const href of hrefs) expect(href).toMatch(/^\/artists\/[a-z-]+\/$/);
  });

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
    /* The behaviour is the same on every device now; only the way Playwright
       grants clipboard access is not — the permission name exists in Chromium
       alone. */
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
    const rows = page.locator('[role="menuitem"]');
    /* The handle, not the service: the row has to say which address is about
       to be copied, or the copy reads as a share sheet that failed to open. */
    await expect(rows).toHaveText(['@jona.junglekidz', '@girlsandbass', 'link']);

    // Every row hands out a link; none of them navigates.
    await rows.filter({ hasText: 'link' }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/artists\/jona\/$/);
    await expect(page).toHaveURL(/\/artists\/jona\/$/);

    // A button that appears to do nothing is worse than no button.
    await expect(page.locator('[data-share] [class*="shareDone"]')).toBeVisible();

    /* And it has to say *what* was copied, or the glyph on the row that was
       just pressed keeps promising that Instagram is about to open. */
    const receipt = page.getByRole('status');
    await expect(receipt).toContainText('/artists/jona');
    await expect(receipt).toContainText('copied to clipboard');
    await expect(receipt).toBeHidden({ timeout: 6000 });

    await page.locator('[data-share]').click();
    await rows.filter({ hasText: '@jona.junglekidz' }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('instagram.com');
    await expect(page.getByRole('status')).toContainText('instagram.com/jona.junglekidz');
  });
});

/* A menu that opens past the edge of the screen is unusable and looks broken,
   and it is invisible to every test that only asks whether the menu is there.
   So: measure it. Narrow phones first, because that is where a row of three
   runs out of room. */
/* Nothing on this page may move because of something someone did to it.
   The panel's buttons are floated, and a grid container beside a float is
   narrowed to avoid it — so a button that grew by a word pulled the portrait
   and the whole interview in with it, and pushed them back out two seconds
   later. Rather than testing that one button, this walks the panel and asks
   whether *anything* moved. */
test.describe('nothing moves under the pointer', () => {
  /** Every box in the panel, keyed by its place in the tree so a diff names
      what shifted. Keyed by path rather than by count, because a glyph that
      swaps for another glyph is not a layout change — the box it sits in is
      what matters, and that box has the same address either way. */
  const layout = (page: Page) =>
    page.evaluate(() => {
      const panel = document.querySelector('[data-artist-detail]');
      const out: Record<string, string> = {};

      const walk = (el: Element, path: string) => {
        const r = el.getBoundingClientRect();
        out[path] =
          `${Math.round(r.x)},${Math.round(r.y)},${Math.round(r.width)}x${Math.round(r.height)}`;
        // Inside an SVG there is no layout to lose, and the drawing changes.
        if (el.tagName.toLowerCase() === 'svg') return;
        Array.from(el.children).forEach((child, i) =>
          walk(child, `${path} > ${i} ${child.tagName.toLowerCase()}`)
        );
      };

      if (panel) walk(panel, 'panel');
      return out;
    });

  test('copying a link leaves the page exactly where it was', async ({ page }) => {
    /* Not skipped outside Chromium: the phone is where this was noticed, and
       WebKit grants no clipboard permission, so the write is stubbed. What is
       under test is the layout around the confirmation, not the copy. */
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async () => {}, readText: async () => '' },
      });
    });

    await page.goto('/artists/abscure/');
    await settled(page);
    await expect(page.locator('[data-artist-detail]')).toBeVisible();

    const before = await layout(page);

    await page.locator('[data-share]').click();
    await page.locator('[role="menuitem"]').first().click();
    await expect(page.getByRole('status')).toBeVisible();

    // While the confirmation is up.
    expect(await layout(page)).toEqual(before);

    // And after it has gone again.
    await expect(page.getByRole('status')).toBeHidden({ timeout: 6000 });
    expect(await layout(page)).toEqual(before);
  });

  test('opening the chooser leaves the page where it was', async ({ page }) => {
    await page.goto('/artists/flo-von/');
    await settled(page);

    const before = await layout(page);
    await page
      .locator('[data-artist-detail] [class*="panelLinks"] button[aria-label="zerrro"]')
      .click();
    await expect(page.locator('[role="menu"]')).toBeVisible();
    expect(await layout(page)).toEqual(before);
  });

  test('hovering a card leaves the roster where it was', async ({ page }) => {
    await page.goto('/');
    await settled(page);

    /* Measured against the document, not the window: hovering a card scrolls it
       into view, and that is the pointer moving the page rather than the page
       moving under the pointer. */
    const grid = () =>
      page.$$eval('[data-artist-card]', (cards) =>
        cards.map((c) => {
          const r = c.getBoundingClientRect();
          return `${Math.round(r.x + window.scrollX)},${Math.round(r.y + window.scrollY)},${Math.round(r.width)}x${Math.round(r.height)}`;
        })
      );

    const before = await grid();
    await page.locator('[data-artist-card]').nth(3).hover();
    await page.waitForTimeout(400); // let the hover transition finish
    expect(await grid()).toEqual(before);
  });
});

test.describe('a chooser stays on screen', () => {
  const WIDTHS = [320, 375, 390, 560];

  const fits = async (page: Page, what: string) => {
    const menu = page.locator('[role="menu"]');
    await expect(menu).toBeVisible();
    const box = (await menu.boundingBox())!;
    const width = page.viewportSize()!.width;
    expect(box.x, `${what}: left edge`).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, `${what}: right edge`).toBeLessThanOrEqual(width);
  };

  test('the share menu fits, however narrow the screen', async ({ page }) => {
    await page.goto('/');
    await settled(page);
    await page
      .locator('[data-artist-card]')
      .filter({ hasText: 'Jona' })
      .locator('[data-artist-open]')
      .click();

    for (const width of WIDTHS) {
      // Resize first: a chooser already open closes on resize by design.
      await page.setViewportSize({ width, height: 780 });
      await page.locator('[data-share]').click();
      await fits(page, `share menu at ${width}px`);

      /* The rows stack rather than shedding their labels: a lone mark would
         promise Instagram and then copy something instead. */
      await expect(page.locator('[role="menuitem"]')).toHaveText([
        '@jona.junglekidz',
        '@girlsandbass',
        'link',
      ]);

      await page.keyboard.press('Escape');
    }
  });

  test('the two-destination mark fits too', async ({ page }) => {
    await page.goto('/');
    await settled(page);
    await page
      .locator('[data-artist-card]')
      .filter({ hasText: 'Flo.Von' })
      .locator('[data-artist-open]')
      .click();

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 780 });
      const mark = page
        .locator('[data-artist-detail] [class*="panelLinks"] button[aria-label="zerrro"]')
        .first();
      await mark.scrollIntoViewIfNeeded();
      await mark.click();
      await fits(page, `zerrro menu at ${width}px`);
      await page.keyboard.press('Escape');
    }
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
    await page
      .locator('[data-artist-detail] [class*="panelLinks"] button[aria-label="zerrro"]')
      .click();
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
    await expect(
      page.locator('[data-artist-detail] p button[aria-label="zerrro"]').first()
    ).toBeFocused();
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

    await page
      .getByRole('link', { name: /artists/i })
      .first()
      .click();
    await expect(page.locator('[data-artist-card]').first()).toBeVisible();
  });
});
