import styles from './StatusMessage.module.css';

// Riquadro per errori, liste vuote e avvisi. Il contenuto extra
// (pulsanti, link) arriva da children.
export default function StatusMessage({ title, children, tone = 'neutral', role }) {
  return (
    <div className={`${styles.box} ${styles[tone]}`} role={role}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </div>
  );
}
