import styles from './ServingsStepper.module.css';

export const MIN_SERVINGS = 1;
export const MAX_SERVINGS = 24;

export default function ServingsStepper({ value, onChange }) {
  return (
    <div className={styles.stepper} role="group" aria-label="Porzioni">
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(value - 1)}
        disabled={value <= MIN_SERVINGS}
        aria-label="Una porzione in meno"
      >
        −
      </button>
      <output className={styles.value} aria-live="polite">
        {value} {value === 1 ? 'porzione' : 'porzioni'}
      </output>
      <button
        type="button"
        className={styles.button}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_SERVINGS}
        aria-label="Una porzione in più"
      >
        +
      </button>
    </div>
  );
}
