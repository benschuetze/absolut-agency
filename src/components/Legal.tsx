import { site } from '../data/site';
import styles from './Legal.module.css';

/**
 * Imprint and privacy notice.
 *
 * In German while the rest of the site is in English, on purpose: both are
 * obligations under German law (§ 5 DDG, Art. 13 DSGVO), they are read by
 * German authorities and German visitors, and a translation is one more thing
 * that can drift away from what the law asks for.
 *
 * Everything here is fact rather than boilerplate. The privacy notice says the
 * site stores nothing because it measurably stores nothing — no cookies, no
 * local storage, no third-party requests, fonts served from our own domain. If
 * that ever stops being true — an embedded player, a contact form, analytics —
 * this page has to change in the same commit.
 */

export function Imprint() {
  return (
    <div className={styles.page}>
      <article className={styles.prose}>
        <h1 className={`u-mono ${styles.eyebrow}`}>impressum</h1>

        <h2>Angaben gemäß § 5 DDG</h2>
        <p>
          Silodom GbR
          <br />
          An der Römerbrücke 3
          <br />
          66121 Saarbrücken
          <br />
          Deutschland
        </p>

        <h2>Vertreten durch</h2>
        <p>Björn del Togno</p>

        <h2>Kontakt</h2>
        <p>
          E-Mail:{' '}
          <a className={styles.link} href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </p>

        <h2>Haftung für Links</h2>
        <p>
          Diese Seite verlinkt auf externe Websites, auf deren Inhalte wir keinen Einfluss
          haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
          verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar.
          Bei Bekanntwerden von Rechtsverletzungen entfernen wir solche Links umgehend.
        </p>

        <h2>Urheberrecht</h2>
        <p>
          Die Fotografien der Künstlerinnen und Künstler sowie die Texte dieser Seite sind
          urheberrechtlich geschützt. Eine Verwendung außerhalb der Grenzen des
          Urheberrechts bedarf unserer schriftlichen Zustimmung.
        </p>
      </article>
    </div>
  );
}

export function Privacy() {
  return (
    <div className={styles.page}>
      <article className={styles.prose}>
        <h1 className={`u-mono ${styles.eyebrow}`}>datenschutz</h1>

        <h2>Verantwortlicher</h2>
        <p>
          Silodom GbR, An der Römerbrücke 3, 66121 Saarbrücken.
          <br />
          E-Mail:{' '}
          <a className={styles.link} href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </p>

        <h2>Kurz gefasst</h2>
        <p>
          Diese Website setzt <strong>keine Cookies</strong>, speichert nichts auf Ihrem
          Gerät, bindet keine Inhalte von fremden Servern ein und verwendet keine Analyse-
          oder Tracking-Dienste. Auch die Schriftarten werden von unserem eigenen Server
          ausgeliefert und nicht von Dritten nachgeladen. Eine Einwilligung nach § 25 TDDDG
          ist deshalb nicht erforderlich — und ein Cookie-Banner wäre eine Frage nach einer
          Erlaubnis für etwas, das nicht stattfindet.
        </p>

        <h2>Server-Logfiles beim Hosting</h2>
        <p>
          Die Seite wird von GitHub Pages bereitgestellt (GitHub Inc., 88 Colin P. Kelly Jr.
          Street, San Francisco, CA 94107, USA). Beim Abruf werden technisch notwendige
          Daten verarbeitet, die Ihr Browser übermittelt: IP-Adresse, Datum und Uhrzeit,
          aufgerufene Datei, übertragene Datenmenge, Browsertyp und Betriebssystem.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt
          im sicheren und stabilen Betrieb der Website. Eine Zusammenführung dieser Daten mit
          anderen Datenquellen findet durch uns nicht statt; wir haben auf diese Logfiles
          keinen Zugriff.
        </p>
        <p>
          Dabei können Daten in die USA übermittelt werden. GitHub Inc. ist nach dem EU-U.S.
          Data Privacy Framework zertifiziert; die Übermittlung stützt sich auf den
          Angemessenheitsbeschluss der Europäischen Kommission vom 10. Juli 2023.
        </p>

        <h2>Kontaktaufnahme per E-Mail</h2>
        <p>
          Wenn Sie uns schreiben, verarbeiten wir Ihre Angaben ausschließlich zur Bearbeitung
          Ihrer Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw. lit. f DSGVO. Wir
          löschen die Daten, sobald sie nicht mehr erforderlich sind und keine gesetzlichen
          Aufbewahrungsfristen entgegenstehen.
        </p>

        <h2>Links zu Instagram, SoundCloud und anderen Diensten</h2>
        <p>
          Wir binden keine Inhalte dieser Dienste ein, sondern verlinken sie lediglich. Erst
          wenn Sie einen solchen Link anklicken, werden Daten an den jeweiligen Anbieter
          übertragen. Es gilt dann dessen Datenschutzerklärung.
        </p>

        <h2>Ihre Rechte</h2>
        <p>
          Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16),
          Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18),
          Datenübertragbarkeit (Art. 20) sowie das Recht, der Verarbeitung zu widersprechen
          (Art. 21). Wenden Sie sich dafür an die oben genannte Adresse.
        </p>
        <p>
          Außerdem können Sie sich bei einer Aufsichtsbehörde beschweren. Für uns zuständig
          ist das Unabhängige Datenschutzzentrum Saarland, Fritz-Dobisch-Straße 12, 66111
          Saarbrücken.
        </p>
      </article>
    </div>
  );
}
