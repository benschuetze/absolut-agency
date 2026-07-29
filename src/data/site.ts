/**
 * Single source of truth for the brand. Rename the agency here and it changes
 * everywhere — wordmark, <title>, footer, about page.
 */
export const site = {
  name: 'SUBSTRAT',
  descriptor: 'booking & artist management',
  tagline: 'Electronic music, handled properly.',
  city: 'Berlin',
  timeZone: 'Europe/Berlin',
  founded: 2019,
  email: 'booking@substrat.agency',
  instagram: { label: 'instagram', href: '#' },
  soundcloud: { label: 'soundcloud', href: '#' },
  imprint: { label: 'imprint', href: '#' },
} as const;

export type Site = typeof site;
