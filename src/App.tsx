import { useEffect } from 'react';
import { About } from './components/About';
import { Artists } from './components/Artists';
import { Footer } from './components/Footer';
import { Imprint, Privacy } from './components/Legal';
import { Header } from './components/Header';
import { site } from './data/site';
import { useRoute } from './lib/router';

export default function App() {
  const [route, navigate] = useRoute();

  useEffect(() => {
    const titles: Partial<Record<typeof route, string>> = {
      about: `About — ${site.name}`,
      imprint: `Impressum — ${site.name}`,
      privacy: `Datenschutz — ${site.name}`,
    };
    document.title = titles[route] ?? `${site.name} — ${site.descriptor}`;
  }, [route]);

  return (
    <>
      <Header route={route} onNavigate={navigate} />
      <main id="main" style={{ viewTransitionName: 'page', flex: 1, display: 'flex' }}>
        {route === 'about' ? (
          <About />
        ) : route === 'imprint' ? (
          <Imprint />
        ) : route === 'privacy' ? (
          <Privacy />
        ) : (
          <Artists />
        )}
      </main>
      <Footer onNavigate={navigate} />
    </>
  );
}
