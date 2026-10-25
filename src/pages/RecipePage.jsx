import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import FavoriteButton from '../components/FavoriteButton.jsx';
import IngredientList from '../components/IngredientList.jsx';
import ServingsStepper from '../components/ServingsStepper.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import StepList from '../components/StepList.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useRecipe } from '../hooks/useRecipe.js';
import { formatMinutes } from '../utils/format.js';
import NotFoundPage from './NotFoundPage.jsx';
import styles from './RecipePage.module.css';

export default function RecipePage() {
  const { id } = useParams();

  // gli id di Spoonacular sono numeri: /ricetta/ciao non chiama nemmeno l'API
  if (!/^\d+$/.test(id)) return <NotFoundPage />;

  return <RecipeDetail key={id} id={id} />;
}

function RecipeDetail({ id }) {
  const { status, recipe, error, retry } = useRecipe(id);
  const [chosenServings, setServings] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useDocumentTitle(recipe?.title);

  // finché non si toccano le porzioni valgono quelle della ricetta
  const servings = chosenServings ?? recipe?.servings ?? null;

  // "default" vuol dire che la pagina è stata aperta direttamente da un link:
  // in quel caso indietro porta alla ricerca e non fuori dal sito
  function goBack() {
    if (location.key !== 'default') navigate(-1);
    else navigate('/');
  }

  const back = (
    <button type="button" className={styles.back} onClick={goBack}>
      Torna indietro
    </button>
  );

  if (status === 'loading') {
    return (
      <div className="container">
        {back}
        <div className={styles.skeleton} aria-hidden="true" />
        <p className="visually-hidden" role="status">
          Carico la ricetta
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container">
        {back}
        <StatusMessage title="Ricetta non disponibile" tone="error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={retry}>
            Riprova
          </button>
        </StatusMessage>
      </div>
    );
  }

  if (!recipe.isVegetarian) {
    return (
      <div className="container">
        {back}
        <StatusMessage title="Questa ricetta non è vegetariana">
          <p>Orto mostra solo ricette senza carne e senza pesce, e questa non lo è.</p>
          <Link to="/" className="btn btn-primary">
            Cerca una ricetta vegetariana
          </Link>
        </StatusMessage>
      </div>
    );
  }

  const facts = [
    recipe.readyInMinutes && `Pronta in ${formatMinutes(recipe.readyInMinutes)}`,
    `Dosi per ${recipe.servings} ${recipe.servings === 1 ? 'persona' : 'persone'}`,
  ].filter(Boolean);

  return (
    <article className="container">
      {back}

      <header className={styles.top}>
        {recipe.image && <img className={styles.image} src={recipe.image} alt="" width="636" height="393" />}

        <div className={styles.intro}>
          <h1 className={styles.title} lang="en">
            {recipe.title}
          </h1>

          <ul className={styles.facts}>
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>

          <ul className={styles.badges} aria-label="Caratteristiche">
            <li className={styles.badgeMain}>Vegetariana</li>
            {recipe.badges.map((badge) => (
              <li key={badge}>{badge}</li>
            ))}
          </ul>

          <div className={styles.actions}>
            <FavoriteButton recipe={recipe} variant="full" />
            {recipe.sourceUrl && (
              <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.source}>
                Ricetta originale su {recipe.sourceName || 'sito esterno'}
              </a>
            )}
          </div>

          {recipe.summary && (
            <p className={styles.summary} lang="en">
              {recipe.summary}
            </p>
          )}
        </div>
      </header>

      <div className={styles.body}>
        <section className={styles.ingredients} aria-labelledby="ingredienti">
          <h2 id="ingredienti" className={styles.heading}>
            Ingredienti
          </h2>
          {servings && (
            <>
              <ServingsStepper value={servings} onChange={setServings} />
              <IngredientList ingredients={recipe.ingredients} baseServings={recipe.servings} servings={servings} />
            </>
          )}
        </section>

        <section className={styles.steps} aria-labelledby="procedimento">
          <h2 id="procedimento" className={styles.heading}>
            Procedimento
          </h2>
          {recipe.steps.length > 0 ? (
            <StepList steps={recipe.steps} />
          ) : (
            <p>
              Per questa ricetta il procedimento è solo sul sito originale.{' '}
              {recipe.sourceUrl && (
                <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Leggilo su {recipe.sourceName || 'sito esterno'}
                </a>
              )}
            </p>
          )}
        </section>
      </div>
    </article>
  );
}
