import { Link, NavLink } from 'react-router';
import { useFavorites } from '../hooks/useFavorites.js';
import LeafIcon from './LeafIcon.jsx';
import styles from './Header.module.css';

const linkClass = ({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link);

export default function Header() {
  const { favorites } = useFavorites();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          <LeafIcon className={styles.leaf} />
          orto
        </Link>

        <nav aria-label="Principale" className={styles.nav}>
          <NavLink to="/" end className={linkClass}>
            Cerca
          </NavLink>
          <NavLink to="/preferiti" className={linkClass}>
            Preferiti
            <span className={styles.count} aria-label={`${favorites.length} salvate`}>
              {favorites.length}
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
