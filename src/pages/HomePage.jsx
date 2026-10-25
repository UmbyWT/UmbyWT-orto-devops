import { Link, useSearchParams } from 'react-router';
import RecipeGrid, { SkeletonGrid } from '../components/RecipeGrid.jsx';
import SearchForm, { COURSES } from '../components/SearchForm.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import SuggestionChips from '../components/SuggestionChips.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFavorites } from '../hooks/useFavorites.js';
import { useRecipeSearch } from '../hooks/useRecipeSearch.js';
import styles from './HomePage.module.css';

export default function HomePage() {
  // la ricerca vive nell'indirizzo (?q=pasta&portata=dessert): così
  // il tasto indietro e i link condivisi riportano agli stessi risultati
  const [params, setParams] = useSearchParams();
  const query = (params.get('q') ?? '').trim();
  const type = params.get('portata') ?? '';

  const search = useRecipeSearch(query, type);
  const { favorites } = useFavorites();
  useDocumentTitle(query ? `Ricette con ${query}` : '');

  function handleSearch({ query: nextQuery, type: nextType }) {
    const next = new URLSearchParams({ q: nextQuery });
    if (nextType) next.set('portata', nextType);
    setParams(next);
  }

  const courseLabel = COURSES.find((course) => course.value === type)?.label;

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <h1 className={styles.title}>Cosa cuciniamo oggi?</h1>
          <p className={styles.lead}>
            Solo ricette vegetariane, senza carne e senza pesce. Cerca un piatto o un ingrediente e salva quelle che ti
            piacciono.
          </p>
          <SearchForm initialQuery={query} initialType={type} onSearch={handleSearch} />
          <SuggestionChips current={query} onPick={(word) => handleSearch({ query: word, type })} />
        </div>
      </section>

      <div className="container">
        {query ? (
          <Results search={search} query={query} courseLabel={type ? courseLabel : ''} />
        ) : favorites.length > 0 ? (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionTitle}>Le tue ricette salvate</h2>
              <Link to="/preferiti">Vedi tutte</Link>
            </div>
            <RecipeGrid recipes={favorites.slice(0, 4)} />
          </section>
        ) : (
          <HowItWorks />
        )}
      </div>
    </>
  );
}

const HOW_IT_WORKS = [
  ['Cerca', 'Scrivi un piatto o un ingrediente, in inglese. Arrivano solo ricette vegetariane.'],
  ['Apri la ricetta', 'Trovi tempi, ingredienti e procedimento diviso in passaggi.'],
  ['Cucina', 'Cambia le porzioni e le dosi si ricalcolano. Spunta ingredienti e passaggi mentre vai avanti.'],
];

function HowItWorks() {
  return (
    <section className={styles.section} aria-labelledby="come-funziona">
      <h2 id="come-funziona" className={styles.sectionTitle}>
        Come funziona
      </h2>
      <ol className={styles.how}>
        {HOW_IT_WORKS.map(([title, text]) => (
          <li key={title}>
            <h3 className={styles.howTitle}>{title}</h3>
            <p className={styles.howText}>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Results({ search, query, courseLabel }) {
  const { status, recipes, total, error, hasMore, isLoadingMore, loadMore, retry } = search;
  const where = courseLabel ? ` tra ${courseLabel.toLowerCase()}` : '';

  return (
    <section className={styles.section} aria-busy={status === 'loading'}>
      <p className="visually-hidden" role="status">
        {status === 'success' ? `${total} ricette trovate` : ''}
      </p>

      {status === 'loading' && <SkeletonGrid />}

      {status === 'error' && (
        <StatusMessage title="Ricerca non riuscita" tone="error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={retry}>
            Riprova
          </button>
        </StatusMessage>
      )}

      {status === 'success' && recipes.length === 0 && (
        <StatusMessage title={`Nessuna ricetta per "${query}"${where}`}>
          <p>
            Prova con una parola in inglese più semplice, per esempio un solo ingrediente, oppure togli il filtro della
            portata.
          </p>
        </StatusMessage>
      )}

      {status === 'success' && recipes.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>
            {total} {total === 1 ? 'ricetta' : 'ricette'} per "{query}"{where}
          </h2>
          <RecipeGrid recipes={recipes} />

          <div className={styles.more}>
            {error && (
              <p className={styles.moreError} role="alert">
                {error}
              </p>
            )}
            {hasMore && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={loadMore}
                aria-disabled={isLoadingMore}
              >
                {isLoadingMore ? 'Carico...' : 'Mostra altre ricette'}
              </button>
            )}
            <p className={styles.count}>
              Ne vedi {recipes.length} su {total}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
