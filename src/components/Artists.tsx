import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Artwork } from './Artwork';
import { Choose, type Destination } from './Choose';
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
export function Artists({
  openId,
  onOpen,
  onClose,
}: {
  /** Which artist is open — an address now, not internal state. */
  openId: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
}) {
  /** Which card is under the pointer or holds focus — drives the dim-the-rest state. */
  const [activeId, setActiveId] = useState<string | null>(null);

  const open = artists.find((a) => a.id === openId) ?? null;

  /* Focus came from a card, so it has to go back to that card when the panel
     closes — otherwise the tab order restarts at the top of the document. */
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const close = useCallback(() => {
    onClose();
    openerRef.current?.focus();
  }, [onClose]);

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
                  onOpen(artist.id);
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
  const panel = (
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
        <div className={styles.panelActions}>
          <Share name={artist.name} />
          <button type="button" className={`u-mono ${styles.closeBtn}`} onClick={onClose}>
            close
          </button>
        </div>

        <div className={styles.panelHead}>
          <div className={styles.panelArt}>
            <Artwork id={artist.id} name={artist.name} photo={artist.photo} />
          </div>

          <div className={styles.panelIntro}>
            <h2 className={styles.panelName}>{artist.name}</h2>

            {artist.format ? (
              <p className={`u-mono ${styles.panelMeta}`}>{artist.format}</p>
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
            <p className={styles.answer}>
              <NoteBody
                body={artist.note.body}
                mentions={[
                  ...(artist.links?.other ? [artist.links.other] : []),
                  ...(artist.note.mentions ?? []),
                ]}
              />
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );

  /* No document at build time, so the prerender renders the panel where it
     stands. The browser puts it back on the body on first render. */
  return typeof document === 'undefined' ? panel : createPortal(panel, document.body);
}

/**
 * Hands out the address of the artist who is open.
 *
 * On a phone that is the system share sheet, which is what "share" means there.
 * Everywhere else there is no such thing, so it copies the link and says so —
 * a button that appears to do nothing is worse than no button.
 *
 * It shares `location.href` rather than rebuilding the URL: the panel being
 * open *is* that address, so the browser already holds the right answer.
 */
function Share({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${name} — ${site.name}`, url });
        return;
      } catch {
        /* Dismissed, or refused. Fall through and copy instead. */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* No clipboard permission. Nothing useful left to try. */
    }
  };

  return (
    <button
      type="button"
      className={`u-mono ${styles.shareBtn}`}
      onClick={share}
      aria-label={`Share ${name}`}
      data-share=""
    >
      {copied ? (
        <span className={styles.shareDone}>copied</span>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <circle cx="6" cy="12" r="2.6" />
          <circle cx="17.5" cy="5.8" r="2.6" />
          <circle cx="17.5" cy="18.2" r="2.6" />
          <path d="M8.3 10.8 15.2 7.1M8.3 13.2 15.2 16.9" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

/* Marks that exist as artwork rather than as a path we can draw. Keyed by the
   link's own label, so a link without one falls back to showing that label. */
const MASKS: Record<string, string> = { zerrro: styles.markZerrro };

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

type Mention = { label: string; href?: string; to?: Destination[] };

/**
 * The first mention of each name becomes a link.
 *
 * Addresses are written down once, beside the artist's other links, and the
 * prose stays prose — no markup smuggled into a sentence an artist wrote. A
 * name the body never mentions is simply not linked.
 */
function NoteBody({ body, mentions }: { body: string; mentions: Mention[] }) {
  const found = mentions
    .map((m) => ({ ...m, at: body.indexOf(m.label) }))
    .filter((m) => m.at !== -1)
    .sort((a, b) => a.at - b.at);

  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const m of found) {
    if (m.at < cursor) continue; // an earlier link already covers this stretch
    parts.push(body.slice(cursor, m.at));
    parts.push(
      m.to ? (
        <Choose
          key={m.label}
          to={m.to}
          mark={<span className={styles.markZerrroSmall} />}
          className={styles.inlineLink}
          ariaLabel={m.label}
        >
          {m.label}
        </Choose>
      ) : (
        <a
          key={m.label}
          className={styles.inlineLink}
          href={m.href}
          target="_blank"
          rel="noreferrer noopener"
        >
          {m.label}
        </a>
      )
    );
    cursor = m.at + m.label.length;
  }
  parts.push(body.slice(cursor));

  return <>{parts}</>;
}

function Links({ artist }: { artist: Artist }) {
  const marks = [
    ['instagram', artist.links?.instagram],
    ['soundcloud', artist.links?.soundcloud],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  const other = artist.links?.other;
  if (!marks.length && !other) return null;

  return (
    <p className={styles.panelLinks}>
      {marks.map(([label, href]) => (
        <a key={label} href={href} target="_blank" rel="noreferrer noopener" aria-label={label}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            {ICONS[label]}
          </svg>
        </a>
      ))}

      {/* A brand mark where we have one, its own name where we do not. With
          more than one destination behind it, it opens a chooser instead. */}
      {other ? (
        other.to.length > 1 ? (
          <Choose
            to={other.to}
            mark={<span className={styles.markZerrroSmall} />}
            className={MASKS[other.label] ? undefined : `u-mono ${styles.namedLink}`}
            ariaLabel={other.label}
          >
            {MASKS[other.label] ? (
              <span className={MASKS[other.label]} aria-hidden="true" />
            ) : (
              other.label
            )}
          </Choose>
        ) : (
          <a
            className={MASKS[other.label] ? undefined : `u-mono ${styles.namedLink}`}
            href={other.to[0].href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={other.label}
          >
            {MASKS[other.label] ? (
              <span className={MASKS[other.label]} aria-hidden="true" />
            ) : (
              other.label
            )}
          </a>
        )
      ) : null}
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
