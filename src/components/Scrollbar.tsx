import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import styles from './Scrollbar.module.css';

/** Never shorter than this, or a long page leaves nothing to grab. */
const MIN_THUMB = 28;
/** How long it stays after the scrolling stops. */
const IDLE = 900;
/** Clear of the corner, the way an overlay scrollbar sits inside the frame. */
const INSET = 3;
/** Where the squash at the end of the page saturates. */
const MAX_OVER = 110;
/** How much of the thumb the squash eats at full stretch. */
const SQUASH = 0.6;

type Geometry = { top: number; left: number; height: number; thumb: number; offset: number };

/** Whether this reader asked the system for less movement. */
function usePrefersCalm() {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setCalm(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  return calm;
}

/**
 * One scrollbar, drawn by us, for every platform.
 *
 * Windows draws a wide grey trough with arrow buttons at the ends, Linux
 * something else again, and none of it belongs on this page. The only way to
 * get the same quiet overlay bar everywhere is to hide what the platform
 * draws and draw it here: a rounded thumb that fades in while the content
 * moves, thickens under the pointer, and can be dragged.
 *
 * The native bars are only hidden once this is mounted and measuring, so a
 * page whose JavaScript never arrives keeps the ones the platform gives it.
 */
export function Scrollbar({ within }: { within?: RefObject<HTMLElement | null> }) {
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  /* Signed: negative past the top, positive past the bottom. */
  const [over, setOver] = useState(0);
  const calm = usePrefersCalm();

  const barRef = useRef<HTMLDivElement | null>(null);
  const idleTimer = useRef(0);
  /* Held during a drag so the pointer keeps moving the same scroller even
     when it leaves the thumb. */
  const drag = useRef<{ pointer: number; from: number; scroll: number; per: number } | null>(null);
  const pushed = useRef(0);
  const springing = useRef(0);
  const settle = useRef(0);

  const scroller = useCallback(
    () => (within ? within.current : document.scrollingElement),
    [within]
  );

  const measure = useCallback((): Geometry | null => {
    const el = scroller();
    if (!el) return null;

    const range = el.scrollHeight - el.clientHeight;
    if (range <= 1) return null;

    let top: number, left: number, height: number;
    if (within && within.current) {
      const r = within.current.getBoundingClientRect();
      top = r.top + INSET;
      left = r.right - INSET - 12;
      height = r.height - INSET * 2;
    } else {
      /* The visual viewport rather than the window: on iOS part of the window
         is behind the toolbars, and a bar drawn there is a bar nobody sees. */
      const v = window.visualViewport;
      top = (v?.offsetTop ?? 0) + INSET;
      left = (v?.offsetLeft ?? 0) + (v?.width ?? window.innerWidth) - INSET - 12;
      height = (v?.height ?? window.innerHeight) - INSET * 2;
    }

    const thumb = Math.max(MIN_THUMB, (el.clientHeight / el.scrollHeight) * height);
    const progress = el.scrollTop / range;
    return { top, left, height, thumb, offset: progress * (height - thumb) };
  }, [scroller, within]);

  const show = useCallback(() => {
    setVisible(true);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setVisible(false), IDLE);
  }, []);

  useEffect(() => {
    const el = scroller();
    if (!el) return;

    const update = () => setGeometry(measure());
    const onScroll = () => {
      update();
      show();
    };

    update();
    /* A flash on arrival, the way a platform bar announces itself, then out
       of the way again. */
    show();

    const target: EventTarget = within ? el : window;
    target.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);

    /* Content can grow without anyone scrolling — a panel opening, an image
       arriving, the roster filtering. */
    const observer = new ResizeObserver(update);
    observer.observe(within?.current ?? document.documentElement);
    if (!within) observer.observe(document.body);

    return () => {
      window.clearTimeout(idleTimer.current);
      target.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [measure, scroller, show, within]);

  /* The squash at the end.
   *
   * Keep scrolling once the page has run out and a Mac compresses the thumb
   * against the end of its track, then lets it spring back. No browser
   * reports how far past the end the rubber band has stretched — `scrollTop`
   * simply stops — so the wheel and the finger are read directly, with the
   * same resistance curve: the further it goes, the less it gives. */
  useEffect(() => {
    const el = scroller();
    if (!el) return;

    const damped = () => {
      const raw = pushed.current;
      return Math.sign(raw) * MAX_OVER * (1 - 1 / (Math.abs(raw) / MAX_OVER + 1));
    };

    /* Decay by elapsed time, not by frame count.
     *
     * `requestAnimationFrame` stops in a hidden tab and is throttled on a busy
     * machine, and a spring that counts frames simply stops with it — come
     * back to the tab and the thumb is still squashed against the end. Against
     * the clock, a frame that took ten times as long decays ten times as far,
     * so a late frame lands where an unthrottled one would have. */
    const PER_FRAME = 0.82;
    const spring = () => {
      cancelAnimationFrame(springing.current);
      let last = performance.now();
      const step = (now: number) => {
        const frames = Math.max(0, (now - last) / 16.7);
        last = now;
        pushed.current *= Math.pow(PER_FRAME, frames);
        if (Math.abs(pushed.current) < 1) {
          pushed.current = 0;
          setOver(0);
          return;
        }
        setOver(damped());
        springing.current = requestAnimationFrame(step);
      };
      springing.current = requestAnimationFrame(step);
    };

    /* And if the page goes away mid-bounce there is nothing to animate: let
       go outright, so it is at rest when the reader comes back. */
    const onHidden = () => {
      if (document.visibilityState !== 'hidden') return;
      cancelAnimationFrame(springing.current);
      pushed.current = 0;
      setOver(0);
    };
    document.addEventListener('visibilitychange', onHidden);

    /* A wheel reports every few milliseconds and a finger more often still.
       Coalesced into one update per frame, because more than that is work
       nobody can see — and on a slow phone it is work that costs a frame. */
    let queued = 0;
    const paint = () => {
      cancelAnimationFrame(queued);
      queued = requestAnimationFrame(() => setOver(damped()));
    };

    const push = (delta: number) => {
      const end = el.scrollHeight - el.clientHeight;
      const past = (delta > 0 && el.scrollTop >= end - 1) || (delta < 0 && el.scrollTop <= 0);
      if (!past) return;

      cancelAnimationFrame(springing.current);
      pushed.current += delta;
      paint();
      show();

      // Let go a beat after the input stops, not during it.
      window.clearTimeout(settle.current);
      settle.current = window.setTimeout(spring, 90);
    };

    /* Typed as plain Events: these go on `window` as often as on an element,
       and addEventListener types the callback by the target, not the name. */
    const onWheel = (e: Event) => push((e as WheelEvent).deltaY);

    let finger = 0;
    const onTouchStart = (e: Event) => {
      finger = (e as TouchEvent).touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: Event) => {
      const y = (e as TouchEvent).touches[0]?.clientY ?? finger;
      push(finger - y);
      finger = y;
    };

    const target: EventTarget = within ? el : window;
    target.addEventListener('wheel', onWheel, { passive: true });
    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      cancelAnimationFrame(springing.current);
      cancelAnimationFrame(queued);
      window.clearTimeout(settle.current);
      target.removeEventListener('wheel', onWheel);
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [scroller, show, within]);

  /* Hide what the platform draws — but only while we are here to replace it,
     and only once, however many of these are mounted. */
  useEffect(() => {
    const root = document.documentElement;
    const count = Number(root.dataset.scrollbarCount ?? 0) + 1;
    root.dataset.scrollbarCount = String(count);
    root.dataset.scrollbars = 'custom';
    return () => {
      const left = Number(root.dataset.scrollbarCount ?? 1) - 1;
      root.dataset.scrollbarCount = String(left);
      if (left <= 0) {
        delete root.dataset.scrollbars;
        delete root.dataset.scrollbarCount;
      }
    };
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = scroller();
    const g = geometry;
    if (!el || !g) return;

    const range = el.scrollHeight - el.clientHeight;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointer: event.pointerId,
      from: event.clientY,
      scroll: el.scrollTop,
      // One pixel of thumb travel is this many pixels of content.
      per: range / Math.max(1, g.height - g.thumb),
    };
    setDragging(true);
    event.preventDefault();
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    const el = scroller();
    if (!state || !el || state.pointer !== event.pointerId) return;

    const to = state.scroll + (event.clientY - state.from) * state.per;
    if (within) el.scrollTop = to;
    else window.scrollTo({ top: to, behavior: 'instant' as ScrollBehavior });
    show();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointer !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    show();
  };

  if (typeof document === 'undefined' || !geometry) return null;

  /* Past the end the thumb shortens and stays pinned to the end it ran into,
     which is what reads as the page pushing back. Not for anyone who asked
     for less movement: that is the one piece of this that moves on its own. */
  const stretch = calm ? 0 : Math.min(1, Math.abs(over) / MAX_OVER);
  const height = geometry.thumb * (1 - SQUASH * stretch);
  const offset = over > 0 ? geometry.height - height : over < 0 ? 0 : geometry.offset;

  return createPortal(
    <div
      ref={barRef}
      className={styles.bar}
      style={{ top: geometry.top, left: geometry.left, height: geometry.height }}
      data-visible={visible || dragging ? '' : undefined}
      data-scrollbar={within ? 'panel' : 'page'}
      aria-hidden="true"
    >
      <div
        className={styles.thumb}
        style={{ height, transform: `translateY(${offset}px)` }}
        data-dragging={dragging ? '' : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
    </div>,
    document.body
  );
}
