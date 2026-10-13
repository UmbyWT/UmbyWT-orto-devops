import { useFavorites } from '../hooks/useFavorites.js';
import styles from './FavoriteButton.module.css';

function Heart({ filled }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={styles.heart}>
      <path
        d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4 7.4 4c2 0 3.6 1.1 4.6 2.7C13 5.1 14.6 4 16.6 4c3.5 0 5.8 3.6 4.6 7.1-1.7 4.8-9.2 9.4-9.2 9.4z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// variant "icon": solo il cuore, sopra la foto della scheda
// variant "full": pulsante con testo, nella pagina della ricetta
export default function FavoriteButton({ recipe, variant = 'icon', className = '' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(recipe.id);

  if (variant === 'full') {
    return (
      <button
        type="button"
        className={`btn ${saved ? 'btn-primary' : 'btn-outline'} ${className}`}
        aria-pressed={saved}
        onClick={() => toggleFavorite(recipe)}
      >
        <Heart filled={saved} />
        {saved ? 'Salvata nei preferiti' : 'Salva nei preferiti'}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`${styles.icon} ${saved ? styles.saved : ''} ${className}`}
      aria-pressed={saved}
      aria-label={saved ? `Togli ${recipe.title} dai preferiti` : `Salva ${recipe.title} nei preferiti`}
      onClick={() => toggleFavorite(recipe)}
    >
      <Heart filled={saved} />
    </button>
  );
}
