import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './Choose.module.css';

export type Destination = {
  label: string;
  /** A place to go. */
  href?: string;
  /** Or something to do here instead — copying the address, for instance. */
  onSelect?: () => void;
  /** Its own glyph, where the destinations are not all the same kind of thing. */
  mark?: ReactNode;
};

/**
 * One trigger, several destinations.
 *
 * Anchored to what was clicked rather than centred on the screen: the panel
 * underneath is already a dialog, and a second one stacked on top of it reads
 * as an interruption. A small menu at the pointer reads as the link expanding.
 *
 * It closes on Escape, on a click outside, and on any scroll — the position is
 * measured once at open, so rather than tracking the anchor as the panel
 * scrolls away underneath, it gets out of the way.
 */
export function Choose({
  to,
  mark,
  className,
  children,
  ariaLabel,
  ...rest
}: {
  to: Destination[];
  /** Drawn beside any destination that does not bring its own. */
  mark?: ReactNode;
  className?: string;
  children: ReactNode;
  ariaLabel: string;
  /** Anything else lands on the trigger — a data attribute for a test, say. */
  [key: `data-${string}`]: string;
}) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback((returnFocus = true) => {
    setAt(null);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const open = () => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setAt({ x: r.left + r.width / 2, y: r.bottom + 8 });
  };

  useEffect(() => {
    if (!at) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation(); // the artist panel listens for Escape too
        close();
      }
    };
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        close(false);
      }
    };
    const onScroll = () => close(false);

    document.addEventListener('keydown', onKey, true);
    document.addEventListener('mousedown', onPointer);

    /* Not until the next frame. The click that opened this can itself move the
       panel — focus alone will scroll an element into view — and a scroll
       listener attached synchronously catches that and shuts the menu before
       anyone sees it. */
    const armed = requestAnimationFrame(() => {
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('resize', onScroll);
    });

    return () => {
      cancelAnimationFrame(armed);
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('mousedown', onPointer);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [at, close]);

  /* Nudge back inside the viewport before the first paint, so a menu opened
     near an edge never appears and then jumps. */
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!at || !menu) return;
    const r = menu.getBoundingClientRect();
    const margin = 12;
    let dx = 0;
    if (r.left < margin) dx = margin - r.left;
    if (r.right > window.innerWidth - margin) dx = window.innerWidth - margin - r.right;
    if (dx) menu.style.transform = `translate(calc(-50% + ${dx}px), 0)`;
  }, [at]);

  return (
    <>
      <button
        {...rest}
        ref={triggerRef}
        type="button"
        className={className}
        onClick={() => (at ? close() : open())}
        aria-haspopup="menu"
        aria-expanded={at ? true : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </button>

      {at
        ? createPortal(
            <div
              ref={menuRef}
              className={styles.menu}
              role="menu"
              aria-label={ariaLabel}
              style={{ left: at.x, top: at.y }}
            >
              {to.map((d) => {
                const body = (
                  <>
                    <span className={styles.optionMark} aria-hidden="true">
                      {d.mark ?? mark}
                    </span>
                    <span className={`u-mono ${styles.optionLabel}`}>{d.label}</span>
                  </>
                );

                return d.href ? (
                  <a
                    key={d.label}
                    className={styles.option}
                    role="menuitem"
                    href={d.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    onClick={() => close(false)}
                  >
                    {body}
                  </a>
                ) : (
                  <button
                    key={d.label}
                    type="button"
                    className={styles.option}
                    role="menuitem"
                    onClick={() => {
                      d.onSelect?.();
                      close();
                    }}
                  >
                    {body}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
    </>
  );
}
