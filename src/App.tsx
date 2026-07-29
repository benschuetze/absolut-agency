import { useEffect } from 'react';
import { About } from './components/About';
import { Artists } from './components/Artists';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { site } from './data/site';
import { useRoute } from './lib/router';

export default function App() {
  const [route, navigate] = useRoute();

  useEffect(() => {
    document.title =
      route === 'about'
        ? `About — ${site.name}`
        : `${site.name} — ${site.descriptor}`;
  }, [route]);

  return (
    <>
      <Header route={route} onNavigate={navigate} />
      <main id="main" style={{ viewTransitionName: 'page', flex: 1, display: 'flex' }}>
        {route === 'about' ? <About /> : <Artists />}
      </main>
      <Footer />
    </>
  );
}
