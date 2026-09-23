import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export const routes = ['artists', 'about', 'imprint', 'privacy'] as const;
export type Route = (typeof routes)[number];

/**
 * Where we are. An artist is not a page of its own — it is the roster with that
 * artist open, which is exactly what a click already produces. Giving that state
 * an address is the whole change: the view does not move, but it can now be
 * linked, shared, found, and rendered to HTML at build time.
 */
export type Location = { route: Route; artist?: string };

/**
 * The ones the header offers. The legal pages are reachable and indexable, but
 * they are an obligation rather than a destination — the footer is where people
 * look for them, and putting them beside the roster would say otherwise.
 */
export const navRoutes = ['artists', 'about'] as const satisfies readonly Route[];

/**
 * '' in dev, '/absolut-agency' on GitHub Pages. Every path the router reads or
 * writes is relative to this, so the same build works at a subpath or at a root
 * domain without a code change.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

const PATHS: Record<Exclude<Route, 'artists'>, string> = {
  about: '/about',
  imprint: '/impressum',
  privacy: '/datenschutz',
};

const ARTIST_PREFIX = '/artists/';

function pathToLocation(path: string): Location {
  const relative = (path.startsWith(BASE) ? path.slice(BASE.length) : path).replace(/\/+$/, '');

  if (relative.startsWith(ARTIST_PREFIX)) {
    const artist = relative.slice(ARTIST_PREFIX.length);
    /* An id we do not know is not an error worth a page of its own — it is the
       roster, which is what someone following a stale link wants to see. */
    return artist ? { route: 'artists', artist } : { route: 'artists' };
  }

  const hit = (Object.keys(PATHS) as Exclude<Route, 'artists'>[]).find(
    (route) => PATHS[route] === relative
  );
  return { route: hit ?? 'artists' };
}

/**
 * Always with a trailing slash.
 *
 * GitHub Pages serves each of these from its own directory and 301s the
 * slashless form to it. Linking the form it redirects to means no visitor and
 * no crawler ever takes the detour, and the canonical we publish is the URL
 * that actually answers.
 */
export const locationToPath = ({ route, artist }: Location): string => {
  if (route === 'artists') return artist ? `${BASE}${ARTIST_PREFIX}${artist}/` : `${BASE}/`;
  return `${BASE}${PATHS[route]}/`;
};

/** Kept for the header and footer, which only ever link to whole pages. */
export const routeToPath = (route: Route): string => locationToPath({ route });

/**
 * The location to start from when there is no browser — set by the prerender,
 * which renders each page to HTML at build time so crawlers and link previews
 * see the site rather than an empty <div id="root">.
 */
export let initialLocation: Location | null = null;
export const setInitialLocation = (location: Location) => {
  initialLocation = location;
};

/**
 * Two pages do not justify a routing library. This is the whole router:
 * History API + popstate, with the View Transitions API used for the swap
 * where the browser supports it.
 */
export function useRoute(): [Location, (next: Location) => void] {
  const [location, setLocation] = useState<Location>(() =>
    typeof window === 'undefined'
      ? (initialLocation ?? { route: 'artists' })
      : pathToLocation(window.location.pathname)
  );

  useEffect(() => {
    const onPop = () => setLocation(pathToLocation(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback(
    (next: Location) => {
      if (next.route === location.route && next.artist === location.artist) return;
      window.history.pushState({}, '', locationToPath(next));

      /* Opening or closing an artist is not a page change — the roster stays
         put behind the panel, and animating it would be a flicker rather than
         a transition. Scrolling would lose the card you clicked, too. */
      const samePage = next.route === 'artists' && location.route === 'artists';

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const startViewTransition = document.startViewTransition?.bind(document);

      if (startViewTransition && !reduced && !samePage) {
        // flushSync so the DOM is already updated when the browser snapshots.
        startViewTransition(() => flushSync(() => setLocation(next)));
      } else {
        setLocation(next);
      }

      if (!samePage) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    },
    [location],
  );

  return [location, navigate];
}
