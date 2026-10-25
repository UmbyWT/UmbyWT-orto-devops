import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import AppErrorBoundary from './AppErrorBoundary.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import styles from './Layout.module.css';

export default function Layout() {
  const { pathname } = useLocation();

  // cambiando pagina si riparte dall'alto
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        {/* la key fa ripartire il riquadro di errore quando si cambia pagina */}
        <AppErrorBoundary key={pathname}>
          <Outlet />
        </AppErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
