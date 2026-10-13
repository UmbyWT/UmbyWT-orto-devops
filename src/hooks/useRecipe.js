import { useEffect, useReducer, useState } from 'react';
import { getRecipe } from '../api/recipes.js';
import { getErrorMessage } from '../utils/errors.js';

export function useRecipe(id) {
  const [result, setResult] = useState({ status: 'loading', recipe: null, error: null });
  const [attempt, retry] = useReducer((n) => n + 1, 0);

  useEffect(() => {
    const controller = new AbortController();
    setResult({ status: 'loading', recipe: null, error: null });

    getRecipe(id, { signal: controller.signal })
      .then((recipe) => setResult({ status: 'success', recipe, error: null }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setResult({ status: 'error', recipe: null, error: getErrorMessage(error) });
      });

    return () => controller.abort();
  }, [id, attempt]);

  return { ...result, retry };
}
