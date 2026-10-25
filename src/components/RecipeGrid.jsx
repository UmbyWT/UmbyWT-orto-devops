import RecipeCard from './RecipeCard.jsx';
import styles from './RecipeGrid.module.css';

export default function RecipeGrid({ recipes }) {
  return (
    <ul className={styles.grid}>
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <RecipeCard recipe={recipe} />
        </li>
      ))}
    </ul>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <ul className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className={styles.skeleton}>
          <span className={styles.skeletonImage} />
          <span className={styles.skeletonLine} />
          <span className={styles.skeletonLineShort} />
        </li>
      ))}
    </ul>
  );
}
