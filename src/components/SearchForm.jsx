import { useEffect, useId, useRef, useState } from 'react';
import styles from './SearchForm.module.css';

// valori accettati dal parametro "type" di Spoonacular
export const COURSES = [
  { value: '', label: 'Tutte le portate' },
  { value: 'main course', label: 'Piatti principali' },
  { value: 'side dish', label: 'Contorni' },
  { value: 'appetizer', label: 'Antipasti' },
  { value: 'salad', label: 'Insalate' },
  { value: 'soup', label: 'Zuppe' },
  { value: 'breakfast', label: 'Colazione' },
  { value: 'dessert', label: 'Dolci' },
  { value: 'snack', label: 'Snack' },
];

export default function SearchForm({ initialQuery = '', initialType = '', onSearch }) {
  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState(initialType);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);
  const id = useId();

  // se la ricerca cambia da fuori (indietro del browser, suggerimenti)
  // il modulo si allinea all'indirizzo
  useEffect(() => {
    setQuery(initialQuery);
    setType(initialType);
  }, [initialQuery, initialType]);

  function handleSubmit(event) {
    event.preventDefault();
    const text = query.trim();

    if (!text) {
      setShowHint(true);
      inputRef.current?.focus();
      return;
    }

    setShowHint(false);
    onSearch({ query: text, type });
  }

  function handleTypeChange(event) {
    const nextType = event.target.value;
    setType(nextType);
    // con una ricerca già fatta, cambiare portata aggiorna subito i risultati
    if (query.trim()) onSearch({ query: query.trim(), type: nextType });
  }

  return (
    <form className={styles.form} role="search" onSubmit={handleSubmit} noValidate>
      <label htmlFor={`${id}-q`} className="visually-hidden">
        Cerca una ricetta vegetariana
      </label>
      <input
        ref={inputRef}
        id={`${id}-q`}
        className={styles.input}
        type="search"
        placeholder="pasta, curry, pumpkin..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-describedby={`${id}-hint`}
        autoComplete="off"
      />

      <label htmlFor={`${id}-type`} className="visually-hidden">
        Portata
      </label>
      <select id={`${id}-type`} className={styles.select} value={type} onChange={handleTypeChange}>
        {COURSES.map((course) => (
          <option key={course.value} value={course.value}>
            {course.label}
          </option>
        ))}
      </select>

      <button type="submit" className={`btn btn-primary ${styles.submit}`}>
        Cerca
      </button>

      <p id={`${id}-hint`} className={showHint ? styles.hintError : styles.hint}>
        {showHint
          ? 'Scrivi un ingrediente o il nome di un piatto.'
          : 'Le ricette di Spoonacular sono in inglese: cerca in inglese, per esempio pumpkin invece di zucca.'}
      </p>
    </form>
  );
}
