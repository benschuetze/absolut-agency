import { useEffect, useState } from 'react';
import { site } from '../data/site';
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

export function Footer() {
  const time = useAgencyClock();

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
        <a href={site.imprint.href}>{site.imprint.label}</a>
      </span>
    </footer>
  );
}
