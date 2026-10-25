import { useState } from 'react';
import { formatAmount, scaleAmount } from '../utils/format.js';
import styles from './IngredientList.module.css';

export function ingredientLabel(ingredient, baseServings, servings) {
  if (ingredient.amount == null) return ingredient.original;

  const amount = formatAmount(scaleAmount(ingredient.amount, baseServings, servings));
  return `${amount} ${ingredient.unit} ${ingredient.name}`.replace(/\s+/g, ' ');
}

// Lista della spesa: chi cucina spunta quello che ha già preso
export default function IngredientList({ ingredients, baseServings, servings }) {
  const [checked, setChecked] = useState(() => new Set());

  function toggle(key) {
    setChecked((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <ul className={styles.list} lang="en">
      {ingredients.map((ingredient) => (
        <li key={ingredient.key}>
          <label className={styles.item}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={checked.has(ingredient.key)}
              onChange={() => toggle(ingredient.key)}
            />
            <span className={styles.text}>{ingredientLabel(ingredient, baseServings, servings)}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}
