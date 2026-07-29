import { artists } from '../data/artists';
import { site } from '../data/site';
import styles from './About.module.css';

/* All copy below is LOREM IPSUM. Replace it; nothing here says anything. */

const services: [string, string][] = [
  ['Lorem', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.'],
  ['Ipsum', 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.'],
  ['Dolor', 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.'],
  ['Consectetur', 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.'],
];

const facts: [string, string][] = [
  ['lorem', 'Ipsum'],
  ['ipsum', 'Dolor sit amet'],
  ['roster', `${artists.length} artists`],
  ['dolor', 'lorem / ipsum / dolor'],
];

export function About() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={`u-mono ${styles.eyebrow}`}>about</p>
          <h1 className={styles.lead}>
            Lorem ipsum dolor sit amet,{' '}
            <span className={styles.accentWord}>consectetur adipiscing</span> elit, sed do
            eiusmod tempor incididunt.
          </h1>
        </div>

        {/* The roster, set small, so the page never feels like a page of prose. */}
        <ul className={`u-mono ${styles.rosterIndex}`} aria-hidden="true">
          {artists.map((artist) => (
            <li key={artist.id}>{artist.name}</li>
          ))}
        </ul>
      </section>

      <section className={styles.body}>
        <div className={styles.col}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
            fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
            qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
        <div className={styles.col}>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
            doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
            veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
            consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
        </div>
      </section>

      <section className={styles.services} aria-label="Services">
        <h2 className={`u-mono ${styles.sectionTitle}`}>what we do</h2>
        <ul className={styles.serviceList}>
          {services.map(([title, copy]) => (
            <li key={title} className={styles.service}>
              <h3 className={styles.serviceTitle}>{title}</h3>
              <p className={styles.serviceCopy}>{copy}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.contact} aria-label="Details and contact">
        <dl className={styles.facts}>
          {facts.map(([term, value]) => (
            <div key={term} className={styles.fact}>
              <dt className="u-mono">{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className={styles.cta}>
          <p className={`u-mono ${styles.sectionTitle}`}>bookings</p>
          <a className={styles.email} href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <p className={`u-mono ${styles.social}`}>
            <a href={site.instagram.href}>{site.instagram.label}</a>
            <a href={site.soundcloud.href}>{site.soundcloud.label}</a>
          </p>
        </div>
      </section>
    </div>
  );
}
