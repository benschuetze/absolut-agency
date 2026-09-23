import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Copied.module.css';

/**
 * Says what just landed on the clipboard.
 *
 * The share button changing to `copied` says that something happened; it does
 * not say what, and a menu row marked with the Instagram glyph has already
 * raised the expectation that Instagram is about to open. So the address
 * itself is read back — shorn of its protocol, because `https://` is noise
 * nobody is checking for — and then it goes away on its own.
 */
export function Copied({ url }: { url: string | null }) {
  /* Kept mounted for the length of the exit, so the last address does not
     vanish mid-sentence when the strip fades. */
  const [shown, setShown] = useState(url);
  useEffect(() => {
    if (url) return setShown(url);
    const timer = window.setTimeout(() => setShown(null), 260);
    return () => window.clearTimeout(timer);
  }, [url]);

  if (typeof document === 'undefined' || !shown) return null;

  return createPortal(
    <div
      className={styles.strip}
      data-leaving={url ? undefined : ''}
      role="status"
      aria-live="polite"
    >
      <span className={`u-mono ${styles.address}`}>{pretty(shown)}</span>
      <span className={`u-mono ${styles.what}`}>copied to clipboard</span>
    </div>,
    document.body
  );
}

/** `https://www.instagram.com/flo.von` → `instagram.com/flo.von`. */
const pretty = (url: string) =>
  url
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
