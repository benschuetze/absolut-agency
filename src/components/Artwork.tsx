import { useMemo } from 'react';
import { VB_H, VB_W, isNegative, renderTile, techniqueFor } from './tiles';
import styles from './Artwork.module.css';

/**
 * An artist's image.
 *
 * A real `photo` prints in its own colour — the photography is the point, and
 * grading it toward the palette is not ours to do. Without one it is a
 * generated tile — see `tiles.tsx` for why each artist gets a different
 * technique rather than a different seed of the same one.
 */
export function Artwork({ id, name, photo }: { id: string; name: string; photo?: string }) {
  const tile = useMemo(() => {
    if (photo) return null;
    const technique = techniqueFor(id);
    return { technique, neg: isNegative(id), art: renderTile(technique, id, name) };
  }, [id, name, photo]);

  if (photo || !tile) {
    return (
      <div className={styles.frame} data-artist-media="">
        <img
          className={styles.photo}
          src={photo}
          alt={name}
          /* The frame is 4:5 and the files are cut to it, so the browser can
             reserve the space before the image arrives and nothing jumps. */
          width={1000}
          height={1250}
          loading="lazy"
          decoding="async"
        />
        <span className={styles.tint} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={`${styles.frame} ${tile.neg ? styles.neg : ''}`}
      data-artist-media=""
      data-technique={tile.technique}
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`Generated artwork for ${name}`}
      >
        <rect className={styles.ground} width={VB_W} height={VB_H} />
        {tile.art}
      </svg>
    </div>
  );
}
