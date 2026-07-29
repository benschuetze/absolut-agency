/**
 * Single source of truth for the brand. Rename the agency here and it changes
 * everywhere — wordmark, <title>, footer, about page.
 *
 * Confirmed: name, descriptor.
 * Lorem ipsum until the real copy lands: tagline, status.
 * Still placeholder: city, timeZone, email, social links.
 */
export const site = {
  name: 'absolut',
  descriptor: 'booking & artist management',
  /** The large statement on the artists page, before anything is hovered. */
  tagline: 'Lorem ipsum dolor sit amet.',
  /** The line in the footer, left of the clock. */
  status: 'lorem ipsum dolor — sit amet',
  city: 'Berlin',
  timeZone: 'Europe/Berlin',
  email: 'booking@absolut.agency',
  instagram: { label: 'instagram', href: '#' },
  soundcloud: { label: 'soundcloud', href: '#' },
  imprint: { label: 'imprint', href: '#' },
} as const;

export type Site = typeof site;
