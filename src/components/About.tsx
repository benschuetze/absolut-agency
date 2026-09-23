import { artists } from '../data/artists';
import { site } from '../data/site';
import styles from './About.module.css';

/**
 * All copy on this page is the agency's own. Nothing here is written by us, and
 * nothing is filled in where they have not said anything — the "what we do"
 * list this page used to carry was lorem ipsum, and a services list nobody has
 * written is worse than no services list.
 */

const facts: [string, string][] = [
  ['home', 'Silodom, Saarbrücken'],
  ['roster', `${artists.length} artists`],
];

export function About() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={`u-mono ${styles.eyebrow}`}>about</p>
          <h1 className={styles.lead}>
            For over 13 years, Silodom has been a home for electronic music and nightlife in{' '}
            <span className={styles.accentWord}>Saarbrücken</span> — perhaps not the most famous
            city on the map, but one with a long-standing and deeply rooted electronic music
            scene.
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
            From the second Hard Wax location to the many artists, DJs and collectives that have
            shaped the scene over the years, Saarbrücken has always had a strong connection to
            electronic music. Silodom has been part of that story from the beginning, with its
            residents playing a central role in shaping the sound of the city.
          </p>
          <p>
            We’ve always been more interested in the music than the spotlight. No big claims, no
            unnecessary noise, just DJs who know what they’re doing, people who care about the
            music, and good vibes on the dancefloor.
          </p>
          <p>But after 13 years, we thought it might be time to turn the volume up a little.</p>
        </div>
        <div className={styles.col}>
          <p>
            Our booking agency brings together a carefully selected roster of artists, each with
            their own sound, character and vision. Different styles, different approaches, but
            one thing in common: the ability to make a dancefloor move.
          </p>
          <p>
            At a time when quantity sometimes seems to be winning over quality, we’d rather keep
            things simple: great music, real skills and good vibes.
          </p>
          <p className={styles.closing}>
            No hype. No formula.
            <br />
            Just artists we genuinely believe in.
          </p>
        </div>
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
