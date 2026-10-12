import { describe, expect, it } from 'vitest';
import { artists, PROFILE_QUESTIONS } from './artists';

/**
 * The roster is hand-edited, often by someone who is not a developer. These
 * checks catch the slips that would otherwise only show up on the live site:
 * a pasted slug, an artist without a photo, a link that is not a link.
 */
describe('roster data', () => {
  it('every id is a unique, URL-safe slug, because it is the artist’s address', () => {
    const ids = artists.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id, id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('every name is there once', () => {
    const names = artists.map((a) => a.name.trim());
    expect(names.every((n) => n.length > 0)).toBe(true);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every artist has a photo, a genre and at least one interview answer', () => {
    for (const a of artists) {
      expect(a.photo, `${a.name}: photo`).toBeTruthy();
      expect(a.tags?.length ?? 0, `${a.name}: genre`).toBeGreaterThan(0);
      const answers = Object.values(a.profile ?? {}).filter((v) => v?.trim());
      expect(answers.length, `${a.name}: interview`).toBeGreaterThan(0);
    }
  });

  it('answers only use questions that exist', () => {
    const known = new Set(Object.keys(PROFILE_QUESTIONS));
    for (const a of artists) {
      for (const key of Object.keys(a.profile ?? {})) expect(known.has(key), `${a.name}: ${key}`).toBe(true);
    }
  });

  it('every outgoing link is https', () => {
    for (const a of artists) {
      const hrefs = [
        a.links?.instagram,
        a.links?.soundcloud,
        ...(a.links?.other?.to.map((t) => t.href) ?? []),
        ...(a.note?.mentions?.map((m) => m.href) ?? []),
      ].filter((h): h is string => Boolean(h));
      for (const href of hrefs) expect(href, `${a.name}: ${href}`).toMatch(/^https:\/\//);
    }
  });
});
