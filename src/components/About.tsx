import { artists } from '../data/artists';
import { site } from '../data/site';
import styles from './About.module.css';

const services = [
  ['Booking', 'Worldwide, club and festival. One point of contact, contracts and advancing included.'],
  ['Management', 'Career strategy, release planning and label negotiation for a small number of artists.'],
  ['Production', 'Live show development, technical riders and rehearsal logistics.'],
  ['Press', 'Campaign planning with partner agencies in DE, UK, FR and BENELUX.'],
];

const facts: [string, string][] = [
  ['founded', String(site.founded)],
  ['based', `${site.city}, Germany`],
  ['roster', `${artists.length} artists`],
  ['territories', 'europe / americas / asia'],
];

export function About() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={`u-mono ${styles.eyebrow}`}>about</p>
          <h1 className={styles.lead}>
            We look after the time of{' '}
            <span className={styles.accentWord}>{artists.length} artists</span> — and treat a
            booking as the beginning of the work, not the end of it.
          </h1>
        </div>

        {/* The roster, set small, so the page never feels like a page of prose. */}
        <ul className={`u-mono ${styles.rosterIndex}`} aria-hidden="true">
          {artists.map((artist, index) => (
            <li key={artist.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {artist.name}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.body}>
        <div className={styles.col}>
          <p>
            Founded in {site.city} in {site.founded}, {site.name} is a booking and artist
            management agency for electronic music. The roster is deliberately small. We would
            rather place {artists.length} artists correctly than move a hundred through a
            spreadsheet.
          </p>
          <p>
            That means we say no on behalf of our artists more often than we say yes: to slots
            that do not fit, to routings that do not make sense, and to fees that do not reflect
            the work. What is left is a calendar an artist can actually live inside.
          </p>
        </div>
        <div className={styles.col}>
          <p>
            We advance every show ourselves — technical riders, backline, travel, settlement —
            and we stay reachable on the night. Promoters get one contact who answers. Artists
            get someone who has already read the contract.
          </p>
          <p>
            For promoters: enquiries are answered within two working days, including the ones we
            decline. For artists: we are not currently open for submissions, but the inbox is
            read.
          </p>
        </div>
      </section>

      <section className={styles.services} aria-label="Services">
        <h2 className={`u-mono ${styles.sectionTitle}`}>what we do</h2>
        <ol className={styles.serviceList}>
          {services.map(([title, copy], index) => (
            <li key={title} className={styles.service}>
              <span className={`u-mono ${styles.serviceIndex}`}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.serviceTitle}>{title}</h3>
              <p className={styles.serviceCopy}>{copy}</p>
            </li>
          ))}
        </ol>
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
