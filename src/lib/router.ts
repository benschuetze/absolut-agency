import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

export const routes = ['artists', 'about'] as const;
export type Route = (typeof routes)[number];

const pathToRoute = (path: string): Route => (path.replace(/\/+$/, '') === '/about' ? 'about' : 'artists');
const routeToPath = (route: Route): string => (route === 'about' ? '/about' : '/');

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
