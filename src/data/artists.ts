export type Artist = {
  /** Stable slug — used as React key, artwork seed, and the future artist route. */
  id: string;
  name: string;
  /** Home base, shown in the row meta. Omit until confirmed. */
  city?: string;
  /** "live", "dj", "live / dj" — the booking format. Omit until confirmed. */
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
 * Names are final. Everything else is still open — `city`, `format`, `bio` and
 * `tags` are deliberately left undefined rather than guessed, because these are
 * real people and invented credits would go live looking like facts. Each field
 * degrades cleanly: a missing city just leaves the meta column empty, a missing
 * bio shows a muted placeholder line in the preview panel.
 *
 * To finish an entry, fill in:
 *   city:   'Berlin'
 *   format: 'live' | 'dj' | 'live / dj'
 *   bio:    two or three sentences
 *   tags:   ['hypnotic', 'modular']   — three works best
 */
export const artists: Artist[] = [
  { id: 'sdb', name: 'SDB' },
  { id: 'al-fatmalay', name: 'Al-Fatmalay' },
  { id: 'p-vonschwind', name: 'P.VonSchwind' },
  { id: 'contrast', name: 'Contrast' },
  { id: 'lea-lindner', name: 'Lea Lindner' },
  { id: 'bjorn-del-togno', name: 'Björn Del Togno' },
  { id: 'abscure', name: 'Abscure' },
  { id: 'flo-von', name: 'Flo.Von' },
];
