/**
 * Writes a real HTML file for every route.
 *
 * Runs after the client build: Vite compiles the app a second time for Node,
 * each route is rendered to a string, and the markup plus that page's own title
 * and description are baked into a copy of the built index.html.
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
const PAGES = [
  {
    route: 'artists',
    path: '/',
    title: 'silodom agency — booking & artist management',
    description:
      'Booking and artist management from Saarbrücken, out of the Silodom. Ten artists, each with their own sound — techno, house, tech house, drum & bass. Different styles. One home.',
  },
  {
    route: 'about',
    path: '/about',
    title: 'About — silodom agency',
    description:
      'For over 13 years Silodom has been a home for electronic music in Saarbrücken. The booking agency brings together a selected roster of artists. No hype, no formula.',
  },
  {
    route: 'imprint',
    path: '/impressum',
    title: 'Impressum — silodom agency',
    description: 'Angaben gemäß § 5 DDG für silodom agency, Silodom GbR, Saarbrücken.',
  },
  {
    route: 'privacy',
    path: '/datenschutz',
    title: 'Datenschutz — silodom agency',
    description:
      'Diese Website setzt keine Cookies, speichert nichts auf Ihrem Gerät und bindet keine fremden Dienste ein.',
  },
];

execFileSync(
  'npx',
  ['vite', 'build', '--ssr', 'src/entry-server.tsx', '--outDir', '.ssr-build', '--logLevel', 'warn'],
  { cwd: root, stdio: 'inherit' }
);

const { render, artists, site } = await import(resolve(ssrDir, 'entry-server.js'));

/* Structured data: who the agency is, and who is on the roster. Built from the
   same data the page renders, so the two cannot drift apart. */
const structuredData = {
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
    ...(artist.tags?.length ? { genre: artist.tags } : {}),
    ...(artist.links?.instagram || artist.links?.soundcloud
      ? { sameAs: [artist.links.instagram, artist.links.soundcloud].filter(Boolean) }
      : {}),
  })),
};
const shell = readFileSync(resolve(dist, 'index.html'), 'utf8');

/** Swap a tag's content without disturbing the rest of the head. */
const swap = (html, pattern, replacement) => {
  if (!pattern.test(html)) throw new Error(`prerender: nothing matched ${pattern}`);
  return html.replace(pattern, replacement);
};

for (const page of PAGES) {
  const url = `${ORIGIN}${page.path === '/' ? '/' : page.path}`;
  let html = shell;

  html = swap(html, /<title>[^<]*<\/title>/, `<title>${page.title}</title>`);
  html = swap(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${page.description}" />`
  );
  html = swap(
    html,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`
  );
  html = swap(
    html,
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${page.title}" />`
  );
  html = swap(
    html,
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${url}" />`
  );
  html = swap(
    html,
    /<div id="root"><\/div>/,
    `<div id="root">${render(page.route)}</div>`
  );

  if (page.route === 'artists') {
    html = html.replace(
      '</head>',
      `  <script type="application/ld+json">${JSON.stringify(structuredData)}</script>\n  </head>`
    );
  }

  const target = page.path === '/' ? resolve(dist, 'index.html') : resolve(dist, page.path.slice(1), 'index.html');
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
  console.log(`prerendered ${page.path.padEnd(14)} ${html.length} bytes`);
}

rmSync(ssrDir, { recursive: true, force: true });
