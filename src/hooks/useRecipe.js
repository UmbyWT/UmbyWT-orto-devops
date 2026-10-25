import { useEffect, useReducer, useState } from 'react';
import { getRecipe } from '../api/recipes.js';
import { reportApiError } from '../monitoring/sentry.js';
import { getErrorMessage } from '../utils/errors.js';

export function useRecipe(id) {
  const [attempt, retry] = useReducer((n) => n + 1, 0);
  // ogni richiesta ha una chiave: un nuovo tentativo ne crea una nuova
  const requestKey = `${id}#${attempt}`;
  const [result, setResult] = useState({ key: null, status: 'loading', recipe: null, error: null });

  useEffect(() => {
    const controller = new AbortController();

    getRecipe(id, { signal: controller.signal })
      .then((recipe) => setResult({ key: requestKey, status: 'success', recipe, error: null }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        reportApiError(error, { endpoint: 'recipe', id });
        setResult({ key: requestKey, status: 'error', recipe: null, error: getErrorMessage(error) });
      });

    return () => controller.abort();
  }, [id, requestKey]);

  // finché la risposta non riguarda la richiesta corrente, si sta caricando
  if (result.key !== requestKey) {
    return { status: 'loading', recipe: null, error: null, retry };
  }
  return { status: result.status, recipe: result.recipe, error: result.error, retry };
}
