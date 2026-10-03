import { useEffect, useRef } from 'react';
import { AppStateProvider, useAppState } from './lib/AppState.jsx';
import { useHashRouter, paths } from './lib/router.js';
import { Header } from './components/Header.jsx';
import { DesignSwitcher } from './components/DesignSwitcher.jsx';
import { BrandIntroProvider } from './components/BrandIntro.jsx';
import {
  EmptyState,
  LoadError,
  Loading,
} from './components/ui.jsx';
import { IconClose } from './components/Icons.jsx';
import { Login } from './pages/Login.jsx';
import { Home, Brands, BrandModels } from './pages/Browse.jsx';
import { Vehicle } from './pages/Vehicle.jsx';
import { Item } from './pages/Item.jsx';
import { AIFinder } from './pages/AIFinder.jsx';
import { Records } from './pages/Records.jsx';
import { Admin } from './pages/Admin.jsx';

function Toast() {
  const { toast, dismissToast } = useAppState();

  if (!toast) return null;

  return (
    <div
      className={`toast toast--${toast.tone}`}
      role="status"
      key={toast.id}
    >
      <span>{toast.text}</span>
      <button
        type="button"
        className="icon-btn icon-btn--sm"
        onClick={dismissToast}
        aria-label="Dismiss message"
      >
        <IconClose size={16} />
      </button>
    </div>
  );
}

function Screen({ route, navigate }) {
  const [a, b, c, d] = route.parts;

  if (!a) return <Home navigate={navigate} />;
  if (a === 'brands') return <Brands navigate={navigate} />;

  if (a === 'brand' && b) {
    return <BrandModels brandId={b} navigate={navigate} />;
  }

  if (a === 'vehicle' && b && c === 'item' && d) {
    return (
      <Item
        modelId={b}
        productId={d}
        query={route.query}
        navigate={navigate}
      />
    );
  }

  if (a === 'vehicle' && b) {
    return (
      <Vehicle
        modelId={b}
        query={route.query}
        navigate={navigate}
      />
    );
  }

  if (a === 'ai') {
    return <AIFinder query={route.query} navigate={navigate} />;
  }

  if (a === 'records') return <Records navigate={navigate} />;
  if (a === 'admin') return <Admin navigate={navigate} />;

  return (
    <EmptyState
      title="Page not found"
      actions={
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => navigate(paths.home())}
        >
          Go to Home
        </button>
      }
    >
      The link may be incomplete.
    </EmptyState>
  );
}

function Shell() {
  const { route, navigate } = useHashRouter();
  const {
    session,
    currentUser,
    catalog,
    reloadCatalog,
  } = useAppState();

  const intended = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    if (session.status === 'checking') return;

    if (!currentUser && route.parts[0] !== 'login') {
      intended.current = route.path;
      navigate(paths.login(), { replace: true });
    }

    if (currentUser && route.parts[0] === 'login') {
      navigate(paths.home(), { replace: true });
    }
  }, [session.status, currentUser, route.path]);

  useEffect(() => {
    const onMove = (event) => {
      const element = event.target?.closest?.('.spot');
      if (!element) return;

      const rect = element.getBoundingClientRect();

      element.style.setProperty(
        '--mx',
        `${event.clientX - rect.left}px`,
      );
      element.style.setProperty(
        '--my',
        `${event.clientY - rect.top}px`,
      );
    };

    document.addEventListener('pointermove', onMove, {
      passive: true,
    });

    return () => {
      document.removeEventListener('pointermove', onMove);
    };
  }, []);

  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    mainRef.current?.focus({ preventScroll: true });
  }, [route.path]);

  if (session.status === 'checking') {
    return (
      <div className="boot wrap">
        <Loading>Checking your sign-in…</Loading>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Login
        notice={session.message}
        onSignedIn={() => {
          const destination =
            intended.current && intended.current !== '/login'
              ? intended.current
              : paths.home();

          intended.current = null;
          navigate(destination, { replace: true });
        }}
      />
    );
  }

  let content;

  if (catalog.status === 'ready') {
    content = <Screen route={route} navigate={navigate} />;
  } else if (catalog.status === 'error') {
    content = (
      <LoadError
        error={catalog.error}
        title="Couldn’t load the catalogue."
        onRetry={reloadCatalog}
      />
    );
  } else {
    content = <Loading>Loading the catalogue…</Loading>;
  }

  return (
    <div className="app">
      <a
        className="skip"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>

      <Header route={route} navigate={navigate} />

      <main
        id="main"
        className="main wrap"
        tabIndex={-1}
        ref={mainRef}
      >
        <div
          className="screen"
          key={route.path.split('?')[0]}
        >
          {content}
        </div>
      </main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <span className="footer-brand">
            <span className="logo-mark" aria-hidden="true">
              CAA
            </span>{' '}
            AI Product Finder
          </span>
          <span>
            Private catalogue for authorized users. Purchases
            happen on Lazada, Shopee and TikTok.
          </span>
        </div>
      </footer>

      <DesignSwitcher />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <BrandIntroProvider>
        <Shell />
      </BrandIntroProvider>
    </AppStateProvider>
  );
}
