import { useEffect } from 'react';
import { About } from './components/About';
import { Artists } from './components/Artists';
import { Footer } from './components/Footer';
import { Imprint, Privacy } from './components/Legal';
import { Header } from './components/Header';
import { artists } from './data/artists';
import { site } from './data/site';
import { useRoute } from './lib/router';

export default function App() {
  const [{ route, artist }, navigate] = useRoute();

  useEffect(() => {
    const open = artist ? artists.find((a) => a.id === artist) : undefined;
    const titles: Partial<Record<typeof route, string>> = {
      about: `About — ${site.name}`,
      imprint: `Impressum — ${site.name}`,
      privacy: `Datenschutz — ${site.name}`,
    };
    document.title = open
      ? `${open.name} — ${site.name}`
      : (titles[route] ?? `${site.name} — ${site.descriptor}`);
  }, [route, artist]);

  return (
    <>
      <Header route={route} onNavigate={(next) => navigate({ route: next })} />
      <main id="main" style={{ viewTransitionName: 'page', flex: 1, display: 'flex' }}>
        {route === 'about' ? (
          <About />
        ) : route === 'imprint' ? (
          <Imprint />
        ) : route === 'privacy' ? (
          <Privacy />
        ) : (
          <Artists
            openId={artist ?? null}
            onOpen={(id) => navigate({ route: 'artists', artist: id })}
            onClose={() => navigate({ route: 'artists' })}
          />
        )}
      </main>
      <Footer onNavigate={(next) => navigate({ route: next })} />
    </>
  );
}
