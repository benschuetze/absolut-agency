import { site } from '../data/site';
import { routeToPath, routes, type Route } from '../lib/router';
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
        <span className={styles.wordmark}>{site.name}</span>
      </a>

      <nav className={styles.nav} aria-label="Primary">
        {/* Real links, like the wordmark above: these change the URL, so they
            have to survive a middle-click and read as navigation. */}
        {routes.map((item) => (
          <a
            key={item}
            className={styles.tab}
            href={routeToPath(item)}
            data-active={route === item || undefined}
            aria-current={route === item ? 'page' : undefined}
            onClick={(event) => {
              event.preventDefault();
              onNavigate(item);
            }}
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}
