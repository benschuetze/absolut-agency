export type Artist = {
  /** Stable slug — used as React key and for the future artist route. */
  id: string;
  name: string;
  /** Home base, shown in the row meta. */
  city: string;
  /** "live", "dj", "live / dj" — the booking format. */
  format: string;
  /** Shown on hover / expand. Two or three sentences, no more. */
  bio: string;
  /** Genre-ish keywords, rendered as small mono chips. */
  tags: string[];
  /**
   * Drop a real photo in `src/assets/artists/` and import it here.
   * While this is undefined a generative duotone placeholder is drawn instead,
   * so the layout is already correct at final proportions (4:5).
   */
  photo?: string;
};

/**
 * PLACEHOLDER ROSTER — names, cities and copy are invented stand-ins.
 * Replace wholesale; the layout adapts to any number of entries.
 */
export const artists: Artist[] = [
  {
    id: 'arc-lumen',
    name: 'Arc Lumen',
    city: 'Berlin',
    format: 'live',
    bio: 'Modular hardware sets built around a single evolving chord, played without a laptop. Two records on the agency-adjacent imprint and a residency that has run uninterrupted since 2021.',
    tags: ['hypnotic', 'modular', 'ambient techno'],
  },
  {
    id: 'nox-ritual',
    name: 'Nox Ritual',
    city: 'Rotterdam',
    format: 'dj',
    bio: 'Long-form club sets that start at 132 and never announce where they are going. Known for closing rooms rather than opening them.',
    tags: ['peak time', 'trance', 'closing sets'],
  },
  {
    id: 'helle',
    name: 'Helle',
    city: 'Copenhagen',
    format: 'live / dj',
    bio: 'Vocal-led electronics with a background in choral arrangement. The live show is performed standing, with a single mic and no visible screen.',
    tags: ['vocal', 'electronica', 'live show'],
  },
  {
    id: 'fraktur',
    name: 'Fraktur',
    city: 'Leipzig',
    format: 'live',
    bio: 'Industrial rhythm assembled from field recordings taken inside disused plants. Sets are mixed loud, dry and deliberately uncomfortable in the low mids.',
    tags: ['industrial', 'field recording', 'ebm'],
  },
  {
    id: 'sveta-moro',
    name: 'Sveta Moro',
    city: 'Tbilisi',
    format: 'dj',
    bio: 'A record collector first and a selector second — the archive runs from Georgian folk pressings to unreleased dubs. Resident at one club, guest everywhere else.',
    tags: ['eclectic', 'vinyl', 'dub'],
  },
  {
    id: 'oya-deep',
    name: 'Oya Deep',
    city: 'Lisbon',
    format: 'dj',
    bio: 'Percussive, warm and relentlessly danceable; batida and broken rhythm folded into a four-to-the-floor frame. Sunrise slots are the natural habitat.',
    tags: ['percussive', 'batida', 'sunrise'],
  },
  {
    id: 'klangbad',
    name: 'Klangbad',
    city: 'Vienna',
    format: 'live',
    bio: 'A two-person live project performing entirely in mono through a custom valve chain. The room becomes part of the instrument, so no two shows sound alike.',
    tags: ['duo', 'mono', 'dub techno'],
  },
  {
    id: 'meridian-9',
    name: 'Meridian 9',
    city: 'Glasgow',
    format: 'dj',
    bio: 'Fast, bright and technically ruthless — electro and breaks mixed at three decks. Ten years on the circuit without a single press photo.',
    tags: ['electro', 'breaks', 'three decks'],
  },
  {
    id: 'tessa-void',
    name: 'Tessa Void',
    city: 'Montréal',
    format: 'live / dj',
    bio: 'Composer of long-format pieces adapted nightly for the club. Works in residency formats, often across three consecutive nights in one venue.',
    tags: ['long form', 'composition', 'residency'],
  },
  {
    id: 'ultramarin',
    name: 'Ultramarin',
    city: 'Marseille',
    format: 'dj',
    bio: 'Deep, blue-toned house records played slowly and in full. The agency’s longest-standing artist and the reason most of the roster is here.',
    tags: ['deep house', 'slow', 'selector'],
  },
];
