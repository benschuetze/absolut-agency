import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export const routes = ['artists', 'about', 'imprint', 'privacy'] as const;
export type Route = (typeof routes)[number];

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

function pathToRoute(path: string): Route {
  const relative = (path.startsWith(BASE) ? path.slice(BASE.length) : path).replace(/\/+$/, '');
  const hit = (Object.keys(PATHS) as Exclude<Route, 'artists'>[]).find(
    (route) => PATHS[route] === relative
  );
  return hit ?? 'artists';
}

export const routeToPath = (route: Route): string =>
  route === 'artists' ? `${BASE}/` : `${BASE}${PATHS[route]}`;

/**
 * Two pages do not justify a routing library. This is the whole router:
 * History API + popstate, with the View Transitions API used for the swap
 * where the browser supports it.
 */
export function useRoute(): [Route, (next: Route) => void] {
  const [route, setRoute] = useState<Route>(() => pathToRoute(window.location.pathname));

  useEffect(() => {
    const onPop = () => setRoute(pathToRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback(
    (next: Route) => {
      if (next === route) return;
      window.history.pushState({}, '', routeToPath(next));

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const startViewTransition = document.startViewTransition?.bind(document);

      if (startViewTransition && !reduced) {
        // flushSync so the DOM is already updated when the browser snapshots.
        startViewTransition(() => flushSync(() => setRoute(next)));
      } else {
        setRoute(next);
      }

      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    },
    [route],
  );

  return [route, navigate];
}
