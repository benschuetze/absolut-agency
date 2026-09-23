import { site } from '../data/site';
import styles from './About.module.css';

/**
 * All copy on this page is the agency's own, set as one continuous text.
 *
 * It was a display-size opening line above a two-column body, which made the
 * first sentence an advertisement and the rest the small print. It is one
 * statement; it reads as one.
 */

export function About() {
  return (
    <div className={styles.page}>
      <section className={styles.prose} aria-labelledby="about-heading">
        <h1 id="about-heading" className={`u-mono ${styles.eyebrow}`}>
          about
        </h1>

        <p>
          For over 13 years, Silodom has been a home for electronic music and nightlife in
          Saarbrücken, a city with a long-standing and deeply rooted electronic music scene.
        </p>
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
        <p>
          Our booking agency brings together a carefully selected roster of artists, each with
          their own sound, character and vision. Different styles, different approaches, but one
          thing in common: the ability to make a dancefloor move.
        </p>
        <p>
          At a time when quantity sometimes seems to be winning over quality, we’d rather keep
          things simple: great music, real skills and good vibes.
        </p>
        <p>
          No hype. No formula.
          <br />
          Just artists we genuinely believe in.
        </p>
      </section>

      <section className={styles.contact} aria-label="Details and contact">
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
