/**
 * Single source of truth for the brand. Rename the agency here and it changes
 * everywhere — wordmark, <title>, footer, about page.
 *
 * Confirmed: name, descriptor, tagline, city, timeZone, email.
 * Nothing here is a placeholder any more.
 */
export const site = {
  name: 'silodom agency',
  descriptor: 'booking & artist management',
  /** The statement beside the roster heading. The closing line of the about page. */
  tagline: 'Different styles. One home.',
  city: 'Saarbrücken',
  timeZone: 'Europe/Berlin',
  /* On silodom.com, not silodom-agency.com: those mailboxes already exist and
     receive, so both work today rather than after a mailbox is bought. */
  /** Bookings. The address on the about page and in the footer. */
  email: 'agency@silodom.com',
  /** The operator's contact in the imprint and the privacy notice. */
  contact: 'bjoern@silodom.com',
  /* The club's account, not the agency's — the agency does not have one yet.
     Verified as the Saarbrücken venue: the profile is "SILODOM", and posts by
     other accounts tag it alongside the city. `@siloversum` is a different
     venue in the same town and is not it. */
  instagram: { label: 'instagram', href: 'https://www.instagram.com/silodom.club/' },
} as const;

export type Site = typeof site;
