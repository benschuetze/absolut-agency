import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Artwork } from './Artwork';
import { PROFILE_QUESTIONS, artists, type Artist, type ProfileKey } from '../data/artists';
import { site } from '../data/site';
import { BIO_PENDING } from './copy';
import styles from './Artists.module.css';

/**
 * The roster, image first.
 *
 * Every artist's image is on screen the moment the page settles — no hover, no
 * tap. Hover used to be the only way to see a face, which meant touch and
 * keyboard visitors saw a list of words. The card carries the image and the
 * name; everything else lives one click deeper, in a panel that opens for
 * pointer, touch and keyboard alike.
 */
export function Artists() {
  /** Which card is under the pointer or holds focus — drives the dim-the-rest state. */
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const open = artists.find((a) => a.id === openId) ?? null;

  /* Focus came from a card, so it has to go back to that card when the panel
     closes — otherwise the tab order restarts at the top of the document. */
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => {
    setOpenId(null);
    openerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <div className={styles.layout}>
      <section aria-labelledby="roster-heading">
        {/* The images are the page. The heading stays for screen readers and
            for the document outline, and is not drawn. */}
        <h1 id="roster-heading" className="u-visually-hidden">
          {site.name} — roster
        </h1>

        <ul className={styles.grid}>
          {artists.map((artist, index) => (
            <li
              key={artist.id}
              className={styles.card}
              style={{ '--i': index } as React.CSSProperties}
              data-artist-card=""
              data-active={activeId === artist.id ? 'true' : undefined}
            >
              <button
                type="button"
                className={styles.trigger}
                data-artist-open=""
                onMouseEnter={() => setActiveId(artist.id)}
                onMouseLeave={() => setActiveId((current) => (current === artist.id ? null : current))}
                onFocus={() => setActiveId(artist.id)}
                onBlur={() => setActiveId((current) => (current === artist.id ? null : current))}
                onClick={(event) => {
                  openerRef.current = event.currentTarget;
                  setOpenId(artist.id);
                }}
                aria-haspopup="dialog"
              >
                <span className={styles.media}>
                  <Artwork id={artist.id} name={artist.name} photo={artist.photo} />
                </span>

                <span className={styles.caption}>
                  <span className={styles.name} data-artist-name="">
                    {artist.name}
                  </span>
                  {/* The genre, and nothing else. Anything longer belongs in
                      the panel, where there is a measure to set it on. */}
                  <span className={`u-mono ${styles.meta}`}>
                    {artist.tags?.length ? <span>{artist.tags[0]}</span> : null}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {open ? <Detail artist={open} onClose={close} /> : null}
    </div>
  );
}

function Detail({ artist, onClose }: { artist: Artist; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  /* Move focus into the panel on open, so the next Tab continues inside it and
     the close button is one key away. */
  useEffect(() => {
    panelRef.current?.focus();
  }, [artist.id]);

  /* Rendered on the body rather than inside <main>.
   *
   * <main> carries a view-transition-name, which makes it a stacking context,
   * so the overlay's z-index only ever competed with its siblings inside it —
   * never with the sticky header at z-index 50. On a tall window the panel
   * happened to sit below the header and looked fine; on a short one the header
   * cut the artist's name in half. */
  return createPortal(
    <div className={styles.overlay} data-artist-detail="">
      <button
        type="button"
        className={styles.scrim}
        onClick={onClose}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={artist.name}
        tabIndex={-1}
      >
        <button type="button" className={`u-mono ${styles.closeBtn}`} onClick={onClose}>
          close
        </button>

        <div className={styles.panelHead}>
          <div className={styles.panelArt}>
            <Artwork id={artist.id} name={artist.name} photo={artist.photo} />
          </div>

          <div className={styles.panelIntro}>
            <h2 className={styles.panelName}>{artist.name}</h2>

            {artist.sound ? <p className={styles.panelSound}>{artist.sound}</p> : null}

            {artist.since || artist.format ? (
              <p className={`u-mono ${styles.panelMeta}`}>
                {artist.since ? <span>{artist.since}</span> : null}
                {artist.since && artist.format ? <span className={styles.sep}>/</span> : null}
                {artist.format ? <span>{artist.format}</span> : null}
              </p>
            ) : null}

            {artist.tags?.length ? (
              <ul className={styles.panelTags}>
                {artist.tags.map((tag) => (
                  <li key={tag} className="u-mono">
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}

            <Links artist={artist} />
          </div>
        </div>

        <ProfileList artist={artist} />

        {artist.note ? (
          <section className={styles.note}>
            <h3 className={`u-mono ${styles.noteTitle}`}>{artist.note.title}</h3>
            <p className={styles.answer}>{artist.note.body}</p>
          </section>
        ) : null}
      </div>
    </div>,
    document.body
  );
}

/* Brand marks, drawn rather than fetched — an icon font or an SVG sprite for
   two glyphs is a dependency and a network request for nothing. */
const ICONS: Record<string, JSX.Element> = {
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  soundcloud: (
    <>
      <path d="M1.8 13.4v4.2M4.6 11.4v6.2M7.4 9.9v7.7M10.2 11.1v6.5" strokeLinecap="round" />
      <path d="M13 17.6V8.2a5 5 0 0 1 8.2 2.6 3.4 3.4 0 0 1-.8 6.8H13Z" strokeLinejoin="round" />
    </>
  ),
};

function Links({ artist }: { artist: Artist }) {
  const links = [
    ['instagram', artist.links?.instagram],
    ['soundcloud', artist.links?.soundcloud],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  if (!links.length) return null;

  return (
    <p className={styles.panelLinks}>
      {links.map(([label, href]) => (
        <a key={label} href={href} target="_blank" rel="noreferrer noopener" aria-label={label}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            {ICONS[label]}
          </svg>
        </a>
      ))}
    </p>
  );
}

/**
 * The interview.
 *
 * Driven by `PROFILE_QUESTIONS` rather than by the artist's own keys, so every
 * profile asks the same questions in the same order, and one an artist skipped
 * is simply not asked.
 */
function ProfileList({ artist }: { artist: Artist }) {
  const answered = Object.entries(PROFILE_QUESTIONS).filter(
    ([key]) => artist.profile?.[key as ProfileKey]
  );

  if (!answered.length) {
    return (
      <p className={styles.pending} data-pending="">
        {BIO_PENDING}
      </p>
    );
  }

  return (
    <dl className={styles.profile}>
      {answered.map(([key, question]) => (
        <div key={key} className={styles.qa}>
          <dt className={`u-mono ${styles.question}`}>{question}</dt>
          <dd className={styles.answer}>{artist.profile?.[key as ProfileKey]}</dd>
        </div>
      ))}
    </dl>
  );
}
