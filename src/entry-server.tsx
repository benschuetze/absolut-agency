import { renderToString } from 'react-dom/server';
import App from './App';
import { setInitialRoute, type Route } from './lib/router';

/**
 * Renders a route to HTML at build time.
 *
 * The browser still takes over and renders the page itself; this exists so
 * that whoever asks for the URL without running JavaScript — a crawler, a link
 * preview in WhatsApp or Slack — gets the page rather than an empty div.
 */
export function render(route: Route): string {
  setInitialRoute(route);
  return renderToString(<App />);
}

/* The prerender builds the structured data from the same source the page does,
   so the two cannot describe different rosters. */
export { artists } from './data/artists';
export { site } from './data/site';
