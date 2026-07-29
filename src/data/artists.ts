export type Artist = {
  /** Stable slug — used as React key, artwork seed, and the future artist route. */
  id: string;
  name: string;
  /** Home base, shown in the row meta. */
  city?: string;
  /** The booking format — "live", "dj", "live / dj". */
  format?: string;
  /** Shown on hover / expand. Two or three sentences, no more. */
  bio?: string;
  /** Genre-ish keywords, rendered as small mono chips. */
  tags?: string[];
  /**
   * Drop a real photo in `src/assets/artists/` and import it here.
   * While this is undefined a generative duotone placeholder is drawn instead,
   * so the layout is already correct at final proportions (4:5).
   */
  photo?: string;
};

/**
 * The roster.
 *
 * Names are final. City, format, bio and tags are LOREM IPSUM — placeholder text
 * that is obviously placeholder, so nothing on the page can be mistaken for a
 * real credit before the real copy exists. Replace per artist; every field is
 * optional and degrades on its own if you clear one out.
 */
const roster: Artist[] = [
  {
    id: 'abscure',
    name: 'Abscure',
    city: 'Lorem',
    format: 'ipsum',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    tags: ['lorem', 'ipsum', 'dolor'],
  },
  {
    id: 'al-fatmalay',
    name: 'Al-Fatmalay',
    city: 'Ipsum',
    format: 'lorem / ipsum',
    bio: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    tags: ['consectetur', 'adipiscing'],
  },
  {
    id: 'bjorn-del-togno',
    name: 'Björn Del Togno',
    city: 'Dolor',
    format: 'lorem',
    bio: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.',
    tags: ['tempor', 'incididunt', 'labore'],
  },
  {
    id: 'contrast',
    name: 'Contrast',
    city: 'Amet',
    format: 'ipsum',
    bio: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.',
    tags: ['magna', 'aliqua'],
  },
  {
    id: 'flo-von',
    name: 'Flo.Von',
    city: 'Elit',
    format: 'lorem',
    bio: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos.',
    tags: ['veniam', 'nostrud', 'ullamco'],
  },
  {
    id: 'lea-lindner',
    name: 'Lea Lindner',
    city: 'Tempor',
    format: 'lorem / ipsum',
    bio: 'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam.',
    tags: ['laboris', 'aliquip'],
  },
  {
    id: 'p-vonschwind',
    name: 'P.VonSchwind',
    city: 'Labore',
    format: 'ipsum',
    bio: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.',
    tags: ['commodo', 'consequat', 'irure'],
  },
  {
    id: 'sdb',
    name: 'SDB',
    city: 'Aliqua',
    format: 'lorem',
    bio: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.',
    tags: ['voluptate', 'cillum'],
  },
];

/**
 * Sorted here rather than by hand, so new entries can be appended in any order
 * and still land in the right place. `localeCompare` handles the umlaut.
 */
export const artists: Artist[] = [...roster].sort((a, b) => a.name.localeCompare(b.name, 'de'));
