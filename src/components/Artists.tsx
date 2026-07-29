import { useState } from 'react';
import { Artwork } from './Artwork';
import { Stage } from './Stage';
import { artists } from '../data/artists';
import { SPLIT_QUERY, useMediaQuery } from '../lib/useMediaQuery';
import { BIO_PENDING } from './copy';
import styles from './Artists.module.css';

export function Artists() {
  const isSplit = useMediaQuery(SPLIT_QUERY);

  /** Desktop: what the sticky stage is previewing. Sticks to the last hovered name. */
  const [activeId, setActiveId] = useState<string | null>(null);
  /** Mobile: which row is expanded, since there is no hover to speak of. */
  const [openId, setOpenId] = useState<string | null>(null);

  const preview = (id: string) => {
    if (isSplit) setActiveId(id);
  };

  return (
    <div className={styles.layout}>
      <section className={styles.roster} aria-labelledby="roster-heading">
        <div className={`u-mono ${styles.rosterHead}`}>
          <h1 id="roster-heading">roster</h1>
          <span>{String(artists.length).padStart(2, '0')} artists</span>
        </div>

        <ul className={styles.list}>
          {artists.map((artist, index) => {
            const isOpen = openId === artist.id;

            return (
              <li
                key={artist.id}
                className={styles.row}
                style={{ '--i': index } as React.CSSProperties}
                data-open={isOpen || undefined}
              >
                <button
                  type="button"
                  className={styles.trigger}
                  onMouseEnter={() => preview(artist.id)}
                  onFocus={() => preview(artist.id)}
                  onClick={() => {
                    if (isSplit) setActiveId(artist.id);
                    else setOpenId(isOpen ? null : artist.id);
                  }}
                  aria-expanded={isSplit ? undefined : isOpen}
                  aria-controls={isSplit ? undefined : `detail-${artist.id}`}
                >
                  <span className={`u-mono ${styles.index}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.name}>{artist.name}</span>
                  {/* Always rendered, even when empty, so the cue keeps its column. */}
                  <span className={`u-mono ${styles.meta}`}>
                    {artist.city ? <span className={styles.city}>{artist.city}</span> : null}
                    {artist.format ? <span className={styles.format}>{artist.format}</span> : null}
                  </span>
                  <span className={styles.cue} aria-hidden="true" />
                </button>

                {/* Mobile only: the stage has nowhere to live, so the row opens. */}
                <div id={`detail-${artist.id}`} className={styles.detail}>
                  <div className={styles.detailClip}>
                    <div className={styles.detailInner}>
                      <div className={styles.detailArt}>
                        <Artwork id={artist.id} name={artist.name} photo={artist.photo} />
                      </div>
                      <div>
                        <p className={styles.detailBio} data-pending={!artist.bio || undefined}>
                          {artist.bio ?? BIO_PENDING}
                        </p>
                        {artist.tags?.length ? (
                          <ul className={styles.detailTags}>
                            {artist.tags.map((tag) => (
                              <li key={tag} className="u-mono">
                                {tag}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className={styles.stageColumn}>
        <Stage activeId={activeId} />
      </aside>
    </div>
  );
}
