/**
 * Single source of truth for the brand. Rename the agency here and it changes
 * everywhere — wordmark, <title>, footer, about page.
 *
 * Confirmed: name, descriptor, tagline, city, timeZone, email.
 * STILL PLACEHOLDER: the three links. Nobody has given us the agency's own
 * accounts yet, and `#` is visibly broken on purpose rather than quietly wrong.
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
  instagram: { label: 'instagram', href: '#' },
  soundcloud: { label: 'soundcloud', href: '#' },
  imprint: { label: 'imprint', href: '#' },
} as const;

export type Site = typeof site;
