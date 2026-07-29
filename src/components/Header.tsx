import { site } from '../data/site';
import { routes, type Route } from '../lib/router';
import styles from './Header.module.css';

type Props = {
  route: Route;
  onNavigate: (next: Route) => void;
};

export function Header({ route, onNavigate }: Props) {
  return (
    <header className={styles.header}>
      <a
        className={styles.brand}
        href="/"
        onClick={(event) => {
          event.preventDefault();
          onNavigate('artists');
        }}
      >
        <span className={styles.mark} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className={styles.wordmark}>{site.name}</span>
        <span className={`u-mono ${styles.descriptor}`}>{site.descriptor}</span>
      </a>

      <nav className={styles.nav} aria-label="Primary">
        {routes.map((item) => (
          <button
            key={item}
            type="button"
            className={styles.tab}
            data-active={route === item || undefined}
            aria-current={route === item ? 'page' : undefined}
            onClick={() => onNavigate(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </header>
  );
}
