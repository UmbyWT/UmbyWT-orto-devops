import { Link } from 'react-router';
import FavoriteButton from './FavoriteButton.jsx';
import LeafIcon from './LeafIcon.jsx';
import styles from './RecipeCard.module.css';

export default function RecipeCard({ recipe }) {
  return (
    <article className={styles.card}>
      <Link to={`/ricetta/${recipe.id}`} className={styles.link}>
        <div className={styles.media}>
          {recipe.image ? (
            // il titolo è subito sotto, quindi l'immagine non ha bisogno di alt
            <img src={recipe.image} alt="" loading="lazy" width="556" height="370" />
          ) : (
            <LeafIcon className={styles.placeholder} />
          )}
        </div>
        <h3 className={styles.title} lang="en">
          {recipe.title}
        </h3>
      </Link>
      <FavoriteButton recipe={recipe} className={styles.favorite} />
    </article>
  );
}
