import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p>
          Ricette e immagini da{' '}
          <a href="https://spoonacular.com/food-api" target="_blank" rel="noopener noreferrer">
            spoonacular
          </a>
          . Orto è un progetto di studio di Umberto Brignone.
        </p>
      </div>
    </footer>
  );
}
