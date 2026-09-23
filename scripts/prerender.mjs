/**
 * Writes a real HTML file for every address the site has.
 *
 * Runs after the client build: Vite compiles the app a second time for Node,
 * each location is rendered to a string, and the markup plus that page's own
 * title, description and canonical are baked into a copy of the built shell.
 *
 * An artist is not a separate page — it is the roster with that artist's panel
 * open, which is what a click already produces. Prerendering that state is how
 * the interviews become findable without the design moving an inch.
 *
 * `dist/404.html` is deliberately left as the empty shell. GitHub Pages serves
 * it for anything unmatched, and an unknown URL should boot the app rather than
 * claim to be the roster.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const ssrDir = resolve(root, '.ssr-build');
const ORIGIN = 'https://silodom-agency.com';

execFileSync(
  'npx',
  ['vite', 'build', '--ssr', 'src/entry-server.tsx', '--outDir', '.ssr-build', '--logLevel', 'warn'],
  { cwd: root, stdio: 'inherit' }
);

const { render, artists, site } = await import(resolve(ssrDir, 'entry-server.js'));
const shell = readFileSync(resolve(dist, 'index.html'), 'utf8');

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** Trimmed to roughly what a search result will actually show. */
const clamp = (s, max = 155) =>
  s.length <= max ? s : `${s.slice(0, s.lastIndexOf(' ', max - 1))}…`;

/**
 * "How long have you been DJing?" came back as a year from some, a duration
 * from others, and a joke from Flo.Von. Only the first two make a sentence —
 * "DJing since not long enough to get tired of it" is not one, and neither is
 * "DJing since 8 years".
 */
function experience(since) {
  if (!since) return null;
  const year = since.match(/\b(?:19|20)\d{2}\b/);
  if (year) return `DJing since ${year[0]}.`;
  const span = since.match(/^(around\s+)?\d+\s+years?$/i);
  return span ? `DJing for ${since.toLowerCase()}.` : null;
}

/** Enough of an artist's own words to fill a search result, and no more. */
function describe(artist) {
  const parts = [];
  const push = (text) => {
    if (text && parts.join(' ').length < 90) parts.push(text);
  };

  push(artist.profile?.sound);
  push(artist.tags?.length ? `${artist.tags.join(', ')}.` : null);
  push(artist.format ? `${artist.format}.` : null);
  push(experience(artist.profile?.since));
  parts.push('Booking via silodom agency, Saarbrücken.');

  return parts.join(' ');
}

const pages = [
  {
    location: { route: 'artists' },
    path: '/',
    title: 'silodom agency — booking & artist management',
    description:
      'Booking and artist management from Saarbrücken, out of the Silodom. Ten artists, each with their own sound — techno, house, tech house, drum & bass.',
  },
  {
    location: { route: 'about' },
    path: '/about',
    title: 'About — silodom agency',
    description:
      'For over 13 years Silodom has been a home for electronic music in Saarbrücken. The booking agency brings together a selected roster of artists.',
  },
  {
    location: { route: 'imprint' },
    path: '/impressum',
    lang: 'de',
    title: 'Impressum — silodom agency',
    description:
      'Angaben gemäß § 5 DDG für silodom agency — Silodom GbR, An der Römerbrücke 3, 66121 Saarbrücken, vertreten durch Björn del Togno.',
  },
  {
    location: { route: 'privacy' },
    path: '/datenschutz',
    lang: 'de',
    title: 'Datenschutz — silodom agency',
    description:
      'Diese Website setzt keine Cookies, speichert nichts auf Ihrem Gerät und bindet keine fremden Dienste ein.',
  },
  ...artists.map((artist) => ({
    location: { route: 'artists', artist: artist.id },
    path: `/artists/${artist.id}`,
    title: `${artist.name} — silodom agency`,
    /* The artist's own description of their sound leads, because it is the
       truest summary of them. "Dirty." is a fine answer and a useless search
       result, so more of their own answers are added until the line is worth
       reading — nothing invented, just more of what they said. */
    description: clamp(describe(artist)),
    artist,
  })),
];

const organisation = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  description: 'Booking and artist management from Saarbrücken.',
  url: `${ORIGIN}/`,
  email: site.email,
  image: `${ORIGIN}/share.jpg`,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'An der Römerbrücke 3',
    postalCode: '66121',
    addressLocality: 'Saarbrücken',
    addressCountry: 'DE',
  },
  member: artists.map((artist) => ({
    '@type': 'MusicGroup',
    name: artist.name,
    url: `${ORIGIN}/artists/${artist.id}`,
    ...(artist.tags?.length ? { genre: artist.tags } : {}),
    ...(artist.links?.instagram || artist.links?.soundcloud
      ? { sameAs: [artist.links.instagram, artist.links.soundcloud].filter(Boolean) }
      : {}),
  })),
};

const musicGroup = (artist) => ({
  '@context': 'https://schema.org',
  '@type': 'MusicGroup',
  name: artist.name,
  url: `${ORIGIN}/artists/${artist.id}`,
  ...(artist.profile?.sound ? { description: artist.profile.sound } : {}),
  image: `${ORIGIN}/share/${artist.id}.jpg`,
  ...(artist.tags?.length ? { genre: artist.tags } : {}),
  ...(artist.links?.instagram || artist.links?.soundcloud
    ? { sameAs: [artist.links.instagram, artist.links.soundcloud].filter(Boolean) }
    : {}),
  memberOf: { '@type': 'Organization', name: site.name, url: `${ORIGIN}/` },
});

/** Swap a tag's content without disturbing the rest of the head. */
const swap = (html, pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`prerender: nothing matched ${pattern}`);
  return html.replace(pattern, replacement);
};

for (const page of pages) {
  /* The URL GitHub Pages actually answers on — it 301s the slashless form. */
  const url = `${ORIGIN}${page.path === '/' ? '/' : `${page.path}/`}`;
  const title = escape(page.title);
  const description = escape(page.description);
  let html = shell;

  /* The legal pages are written in German while the rest of the site is not.
     Saying so is the difference between a search engine filing them under the
     right language and a screen reader reading them aloud in the wrong one. */
  if (page.lang) {
    html = swap(html, /<html lang="[^"]*">/, `<html lang="${page.lang}">`);
    html = swap(
      html,
      /<meta\s+property="og:locale"\s+content="[^"]*"\s*\/>/,
      '<meta property="og:locale" content="de_DE" />'
    );
  }

  html = swap(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`);
  html = swap(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${description}" />`
  );
  html = swap(html, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`);
  html = swap(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${title}" />`
  );
  html = swap(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${description}" />`
  );
  html = swap(html, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`);

  /* An artist's link previews as that artist, not as the roster. */
  if (page.artist) {
    const image = `${ORIGIN}/share/${page.artist.id}.jpg`;
    html = swap(
      html,
      /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:image" content="${image}" />`
    );
    html = swap(
      html,
      /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:image:alt" content="${escape(page.artist.name)}" />`
    );
  }

  const data = page.artist ? musicGroup(page.artist) : organisation;
  html = html.replace(
    '</head>',
    `  <script type="application/ld+json">${JSON.stringify(data)}</script>\n  </head>`
  );

  html = swap(html, /<div id="root"><\/div>/, `<div id="root">${render(page.location)}</div>`);

  const target = page.path === '/' ? resolve(dist, 'index.html') : resolve(dist, `${page.path.slice(1)}/index.html`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  console.log(`prerendered ${page.path.padEnd(28)} ${String(html.length).padStart(6)} bytes`);
}

/* The sitemap is generated rather than kept by hand, so adding an artist to the
   roster adds them to it. */
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) =>
      `  <url><loc>${ORIGIN}${page.path === '/' ? '/' : `${page.path}/`}</loc><priority>${
        page.path === '/' ? '1.0' : page.artist ? '0.7' : page.path === '/about' ? '0.8' : '0.1'
      }</priority></url>`
  )
  .join('\n')}
</urlset>
`;
writeFileSync(resolve(dist, 'sitemap.xml'), sitemap);
console.log(`sitemap.xml  ${pages.length} URLs`);

rmSync(ssrDir, { recursive: true, force: true });
