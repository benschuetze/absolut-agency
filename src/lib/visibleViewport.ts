import { useEffect } from 'react';

/**
 * Publishes where the visible page actually begins and ends.
 *
 * On iOS — Safari and Chrome alike, since Chrome there is WebKit with its own
 * toolbars — the layout viewport is not what you can see. While a toolbar
 * collapses, and sometimes already on the first load, the layout viewport
 * starts above the visible area and ends below it. Anything pinned with
 * `position: fixed` or `sticky` is placed against that layout viewport, so the
 * header gets drawn behind the address bar with the top of its lettering cut
 * off, which is exactly what a phone screenshot showed.
 *
 * The visual viewport knows both offsets. They are written to the document as
 * `--visible-top` and `--visible-bottom` so any pinned element can keep clear
 * of them in CSS. On every browser that has no such gap both are 0px, and
 * nothing moves.
 */
export function useVisibleViewport() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;

    const sync = () => {
      const top = Math.max(0, Math.round(viewport.offsetTop));
      const bottom = Math.max(
        0,
        Math.round(root.clientHeight - viewport.height - viewport.offsetTop)
      );
      root.style.setProperty('--visible-top', `${top}px`);
      root.style.setProperty('--visible-bottom', `${bottom}px`);
    };

    sync();
    viewport.addEventListener('resize', sync);
    viewport.addEventListener('scroll', sync);
    /* A load or a rotation settles a beat after it is announced — and on the
       first load it is sometimes not announced at all. */
    const settled = window.setTimeout(sync, 300);

    return () => {
      window.clearTimeout(settled);
      viewport.removeEventListener('resize', sync);
      viewport.removeEventListener('scroll', sync);
      root.style.removeProperty('--visible-top');
      root.style.removeProperty('--visible-bottom');
    };
  }, []);
}
