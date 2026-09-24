import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import styles from './Scrollbar.module.css';

/** Never shorter than this, or a long page leaves nothing to grab. */
const MIN_THUMB = 28;
/** How long it stays after the scrolling stops. */
const IDLE = 900;
/**
 * Told, rather than noticed: what a scrollbar cannot observe is a scroller
 * that keeps its size and loses its overflow. Anything that does that to a
 * page fires this.
 */
export const REMEASURE = 'scrollbar:remeasure';

/** Clear of the corner, the way an overlay scrollbar sits inside the frame. */
const INSET = 3;
/** Where the squash at the end of the page saturates. */
const MAX_OVER = 110;
/** How much of the thumb the squash eats at full stretch. */
const SQUASH = 0.6;

type Geometry = {
  /** Only for the page's bar, which is placed against the visual viewport. */
  top?: number;
  right?: number;
  /** Inside a panel: how far the rail is pushed down to cover what is visible. */
  scrolled?: number;
  height: number;
  thumb: number;
  offset: number;
};

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

    const progress = el.scrollTop / range;

    /* A panel's bar lives inside the panel, and the browser places it.
     *
     * Measuring where a panel is on the screen and drawing a fixed bar there
     * means the two can disagree — and they did: the panel slides as it
     * opens, the toolbars on a phone move what `fixed` even means, and every
     * correction is a frame late. So the bar is a child of the scroller
     * instead, pushed down by exactly as far as the scroller is scrolled,
     * which puts it over the visible part without asking anything about the
     * screen. Nothing here can drift, because nothing here is a measurement
     * of where something appeared. */
    if (within) {
      const height = el.clientHeight - INSET * 2;
      const thumb = Math.max(MIN_THUMB, (el.clientHeight / el.scrollHeight) * height);
      return { scrolled: el.scrollTop, height, thumb, offset: progress * (height - thumb) };
    }

    /* The page's bar has no such parent, so it is placed against the visual
       viewport — on iOS part of the window is behind the toolbars, and a bar
       drawn there is a bar nobody sees. */
    const v = window.visualViewport;
    const top = (v?.offsetTop ?? 0) + INSET;
    const right = window.innerWidth - ((v?.offsetLeft ?? 0) + (v?.width ?? window.innerWidth));
    const height = (v?.height ?? window.innerHeight) - INSET * 2;
    const thumb = Math.max(MIN_THUMB, (el.clientHeight / el.scrollHeight) * height);
    return { top, right, height, thumb, offset: progress * (height - thumb) };
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

    /* A target that is still arriving.
     *
     * The panel slides up as it opens, and a resize observer reports a box
     * that changes size, not one that moves — so measuring once at mount
     * froze the bar a few pixels above where the panel came to rest, and it
     * hung over the edge for as long as the panel stayed open. So: follow it
     * for as long as it is animating, then stop. Nothing animates on the
     * page itself, where this ends after one frame. */
    let following = 0;
    const follow = () => {
      update();
      const el = within?.current;
      const moving = el && typeof el.getAnimations === 'function' && el.getAnimations().length > 0;
      if (moving) following = requestAnimationFrame(follow);
    };
    following = requestAnimationFrame(follow);

    /* And in case the animation is one this cannot see — a transition on an
       ancestor, a font arriving and changing the height. */
    const settled = within?.current;
    settled?.addEventListener('animationend', update);
    settled?.addEventListener('transitionend', update);

    /* And when something takes the scrolling away outright — a panel pinning
       the page behind it — it says so. A resize observer does not fire for a
       body that keeps its size and loses its overflow, so without this the
       page's bar stays on screen next to the panel's until the next scroll
       happens to re-measure it. */
    window.addEventListener(REMEASURE, update);

    return () => {
      window.clearTimeout(idleTimer.current);
      target.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(following);
      settled?.removeEventListener('animationend', update);
      settled?.removeEventListener('transitionend', update);
      window.removeEventListener('resize', update);
      window.removeEventListener(REMEASURE, update);
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
     * `requestAnimationFrame` is throttled on a busy machine and suspended
     * outright in a tab nobody is looking at — Gecko especially — so a spring
     * that counts frames stops with it, and the thumb is still squashed when
     * you come back. Two changes: the decay is measured against the clock, so
     * a tick that took ten times as long decays ten times as far; and it is
     * driven by a timer rather than by frames, because a throttled timer still
     * fires while a suspended frame callback never does. */
    const PER_FRAME = 0.82;
    const spring = () => {
      window.clearTimeout(springing.current);
      let last = performance.now();
      const step = () => {
        const now = performance.now();
        const frames = Math.max(0, (now - last) / 16.7);
        last = now;
        pushed.current *= Math.pow(PER_FRAME, frames);
        if (Math.abs(pushed.current) < 1) {
          pushed.current = 0;
          setOver(0);
          return;
        }
        setOver(damped());
        springing.current = window.setTimeout(step, 16);
      };
      springing.current = window.setTimeout(step, 16);
    };

    /* And if the page goes away mid-bounce there is nothing to animate: let
       go outright, so it is at rest when the reader comes back. */
    const onHidden = () => {
      if (document.visibilityState !== 'hidden') return;
      window.clearTimeout(springing.current);
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
      /* A page with nothing to scroll is not a page being pushed past its
         end — without this, every turn of the wheel on a short page reads as
         overscroll, in both directions at once. */
      if (end <= 1) return;

      const past = (delta > 0 && el.scrollTop >= end - 1) || (delta < 0 && el.scrollTop <= 0);
      if (!past) return;

      window.clearTimeout(springing.current);
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
      window.clearTimeout(springing.current);
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
     for less movement: that is the one piece of this that moves on its own.
   *
   * Pinned only where the page is genuinely at that end. A rubber band exists
   * at the stop and nowhere else, so any overscroll left over while the page
   * is mid-way through counts for nothing — otherwise a stray value parks the
   * thumb at an edge and it stops following the page altogether, which is
   * what it does not do any more. */
  const travel = geometry.height - geometry.thumb;
  const atTop = geometry.offset <= 1;
  const atBottom = geometry.offset >= travel - 1;
  const live = over > 0 ? atBottom : over < 0 ? atTop : false;

  const stretch = calm || !live ? 0 : Math.min(1, Math.abs(over) / MAX_OVER);
  const height = geometry.thumb * (1 - SQUASH * stretch);
  const offset = !live ? geometry.offset : over > 0 ? geometry.height - height : 0;

  const inside = within?.current ?? null;

  return createPortal(
    <div
      ref={barRef}
      className={inside ? styles.rail : styles.bar}
      style={
        inside
          ? { height: geometry.height, transform: `translateY(${geometry.scrolled}px)` }
          : { top: geometry.top, right: geometry.right, height: geometry.height }
      }
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
    inside ?? document.body
  );
}
