import styles from './SuggestionChips.module.css';

export const SUGGESTIONS = ['pasta', 'risotto', 'curry', 'lasagna', 'pumpkin soup', 'burger', 'pancakes', 'salad'];

export default function SuggestionChips({ onPick, current }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.label}>Qualche idea</p>
      <ul className={styles.list}>
        {SUGGESTIONS.map((word) => (
          <li key={word}>
            <button
              type="button"
              className={styles.chip}
              aria-pressed={current === word}
              onClick={() => onPick(word)}
            >
              {word}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
