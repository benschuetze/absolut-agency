import { useCallback, useEffect, useRef, useState } from 'react';
import { Artwork } from './Artwork';
import {
  PROFILE_QUESTIONS,
  artists,
  startYear,
  type Artist,
  type ProfileKey,
} from '../data/artists';
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
        <div className={styles.head}>
          <div className={`u-mono ${styles.headMeta}`}>
            <h1 id="roster-heading">roster</h1>
            <span>{artists.length} artists</span>
          </div>
          <p className={styles.statement}>{site.tagline}</p>
        </div>

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
                  {/* Two short facts at most. Anything longer belongs in the
                      panel, where there is a measure to set it on. */}
                  <span className={`u-mono ${styles.meta}`}>
                    {artist.tags?.length ? <span>{artist.tags[0]}</span> : null}
                    {startYear(artist) ? (
                      <span className={styles.since}>{startYear(artist)}</span>
                    ) : null}
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

  return (
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
            <Links artist={artist} />
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
    </div>
  );
}

function Links({ artist }: { artist: Artist }) {
  const links = [
    ['instagram', artist.links?.instagram],
    ['soundcloud', artist.links?.soundcloud],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  if (!links.length) return null;

  return (
    <p className={`u-mono ${styles.panelLinks}`}>
      {links.map(([label, href]) => (
        <a key={label} href={href} target="_blank" rel="noreferrer noopener">
          {label}
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
