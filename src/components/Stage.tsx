import { useEffect, useState } from 'react';
import { Artwork } from './Artwork';
import { artists, type Artist } from '../data/artists';
import { site } from '../data/site';
import styles from './Stage.module.css';

/** How long a retiring layer stays mounted while it fades out. */
const FADE_MS = 620;

type Layer = { id: string | null; k: number };

/**
 * The sticky preview panel next to the roster.
 *
 * Layers are stacked and cross-faded rather than swapped, so moving down the
 * list dissolves one artist into the next instead of blinking. At most four
 * layers exist at once — a fast pointer cannot pile up work.
 */
export function Stage({ activeId }: { activeId: string | null }) {
  const [layers, setLayers] = useState<Layer[]>([{ id: null, k: 0 }]);

  useEffect(() => {
    setLayers((prev) => {
      const top = prev[prev.length - 1];
      if (top.id === activeId) return prev;
      return [...prev.slice(-3), { id: activeId, k: top.k + 1 }];
    });
  }, [activeId]);

  useEffect(() => {
    if (layers.length <= 1) return;
    const timer = window.setTimeout(() => setLayers((current) => current.slice(-1)), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [layers]);

  return (
    <div className={styles.stage} aria-hidden="true">
      {layers.map((layer, index) => {
        const artist = layer.id ? artists.find((a) => a.id === layer.id) : undefined;
        const isTop = index === layers.length - 1;

        return (
          <div key={layer.k} className={styles.layer} data-visible={isTop || undefined}>
            {artist ? <ArtistPanel artist={artist} /> : <IdlePanel />}
          </div>
        );
      })}
    </div>
  );
}

function IdlePanel() {
  return (
    <div className={styles.idle}>
      <p className={styles.statement}>
        {site.tagline.split(' ').map((word, i) => (
          <span key={i} className={styles.word} style={{ '--i': i } as React.CSSProperties}>
            {word}
          </span>
        ))}
      </p>
      <p className={`u-mono ${styles.hint}`}>
        <span className={styles.hintArrow}>←</span> hover a name
      </p>
    </div>
  );
}

function ArtistPanel({ artist }: { artist: Artist }) {
  return (
    <article className={styles.panel}>
      <div className={styles.art}>
        <Artwork id={artist.id} name={artist.name} photo={artist.photo} />
      </div>

      <div className={styles.copy}>
        <h2 className={styles.name}>{artist.name}</h2>
        <p className={`u-mono ${styles.meta}`}>
          {artist.city} <span className={styles.sep}>/</span> {artist.format}
        </p>
        <p className={styles.bio}>{artist.bio}</p>
        <ul className={styles.tags}>
          {artist.tags.map((tag) => (
            <li key={tag} className="u-mono">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
