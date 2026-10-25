import { Link } from 'react-router';
import RecipeGrid from '../components/RecipeGrid.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFavorites } from '../hooks/useFavorites.js';
import styles from './FavoritesPage.module.css';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  useDocumentTitle('Preferiti');

  return (
    <div className="container">
      <h1 className={styles.title}>I tuoi preferiti</h1>

      {favorites.length === 0 ? (
        <StatusMessage title="Non hai ancora salvato ricette">
          <p>Quando una ricetta ti piace tocca il cuore sulla foto: la ritrovi qui anche la prossima volta.</p>
          <Link to="/" className="btn btn-primary">
            Cerca una ricetta
          </Link>
        </StatusMessage>
      ) : (
        <>
          <p className={styles.lead}>
            {favorites.length === 1 ? '1 ricetta salvata' : `${favorites.length} ricette salvate`} su questo
            dispositivo.
          </p>
          <RecipeGrid recipes={favorites} />
        </>
      )}
    </div>
  );
}
