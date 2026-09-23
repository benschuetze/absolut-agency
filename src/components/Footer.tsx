import { useEffect, useState } from 'react';
import { site } from '../data/site';
import { routeToPath, type Route } from '../lib/router';
import styles from './Footer.module.css';

/** Local time at the agency's base — a small sign of life in an otherwise static page. */
function useAgencyClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const format = () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone: site.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date());

    setTime(format());
    const id = window.setInterval(() => setTime(format()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

export function Footer({ onNavigate }: { onNavigate: (next: Route) => void }) {
  const time = useAgencyClock();

  /* Real hrefs, so the pages can be opened in a tab and found by a crawler;
     the click is intercepted so the site does not reload around them. */
  const page = (route: Route, label: string) => (
    <a
      href={routeToPath(route)}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(route);
      }}
    >
      {label}
    </a>
  );

  return (
    <footer className={`u-mono ${styles.footer}`}>
      <span className={styles.clock} aria-label={`Local time in ${site.city}`}>
        {site.city} {time || '--:--:--'}
      </span>

      <span className={styles.links}>
        <a href={`mailto:${site.email}`}>{site.email}</a>
        <a href={site.instagram.href} target="_blank" rel="noreferrer noopener">
          {site.instagram.label}
        </a>
        {page('imprint', 'impressum')}
        {page('privacy', 'datenschutz')}
      </span>
    </footer>
  );
}
