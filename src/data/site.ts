/**
 * Single source of truth for the brand. Rename the agency here and it changes
 * everywhere — wordmark, <title>, footer, about page.
 *
 * Confirmed: name, descriptor, tagline, city, timeZone, email.
 * STILL PLACEHOLDER: `imprint`. It needs a page that does not exist yet, and
 * `#` is visibly broken on purpose rather than quietly wrong.
 */
export const site = {
  name: 'silodom agency',
  descriptor: 'booking & artist management',
  /** The statement beside the roster heading. The closing line of the about page. */
  tagline: 'Different styles. One home.',
  city: 'Saarbrücken',
  timeZone: 'Europe/Berlin',
  /* On silodom.com, not silodom-agency.com: that mailbox already exists and
     receives, so bookings work today rather than after a mailbox is bought. */
  email: 'lena@silodom.com',
  /* The club's account, not the agency's — the agency does not have one yet.
     Verified as the Saarbrücken venue: the profile is "SILODOM", and posts by
     other accounts tag it alongside the city. `@siloversum` is a different
     venue in the same town and is not it. */
  instagram: { label: 'instagram', href: 'https://www.instagram.com/silodom.club/' },
  imprint: { label: 'imprint', href: '#' },
} as const;

export type Site = typeof site;
