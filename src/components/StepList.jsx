import { useState } from 'react';
import styles from './StepList.module.css';

export default function StepList({ steps }) {
  const [done, setDone] = useState(() => new Set());

  function toggle(number) {
    setDone((previous) => {
      const next = new Set(previous);
      if (next.has(number)) next.delete(number);
      else next.add(number);
      return next;
    });
  }

  return (
    <ol className={styles.list} lang="en">
      {steps.map((step) => {
        const isDone = done.has(step.number);

        return (
          <li key={step.number} className={`${styles.step} ${isDone ? styles.done : ''}`}>
            <span className={styles.number} aria-hidden="true">
              {step.number}
            </span>
            <div className={styles.body}>
              <p className={styles.text}>{step.text}</p>
              <label className={styles.check} lang="it">
                <input type="checkbox" checked={isDone} onChange={() => toggle(step.number)} />
                Fatto
              </label>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
