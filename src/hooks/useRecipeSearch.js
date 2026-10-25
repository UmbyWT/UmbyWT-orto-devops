import { useCallback, useEffect, useReducer, useRef } from 'react';
import { searchRecipes } from '../api/recipes.js';
import { reportApiError } from '../monitoring/sentry.js';
import { getErrorMessage } from '../utils/errors.js';
import { initialSearchState, searchReducer } from './searchReducer.js';

// Cerca le ricette quando cambiano testo o portata.
// Se l'utente cambia ricerca prima della risposta, la richiesta vecchia
// viene annullata e il suo risultato non sovrascrive quello nuovo.
export function useRecipeSearch(query, type) {
  const [state, dispatch] = useReducer(searchReducer, initialSearchState);
  const [attempt, setAttempt] = useReducer((n) => n + 1, 0);
  const moreController = useRef(null);

  useEffect(() => {
    if (!query) {
      dispatch({ type: 'reset' });
      return undefined;
    }

    const controller = new AbortController();
    dispatch({ type: 'start' });

    searchRecipes({ query, type, signal: controller.signal })
      .then(({ recipes, total }) => dispatch({ type: 'success', recipes, total }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        reportApiError(error, { endpoint: 'search', query, type });
        dispatch({ type: 'error', error: getErrorMessage(error) });
      });

    return () => {
      controller.abort();
      moreController.current?.abort();
    };
  }, [query, type, attempt]);

  const loadMore = useCallback(async () => {
    if (state.isLoadingMore) return;

    const controller = new AbortController();
    moreController.current = controller;
    dispatch({ type: 'moreStart' });

    try {
      const { recipes, total } = await searchRecipes({
        query,
        type,
        offset: state.recipes.length,
        signal: controller.signal,
      });
      dispatch({ type: 'moreSuccess', recipes, total });
    } catch (error) {
      if (controller.signal.aborted) return;
      reportApiError(error, { endpoint: 'search', query, type, offset: state.recipes.length });
      dispatch({ type: 'moreError', error: getErrorMessage(error) });
    }
  }, [query, type, state.isLoadingMore, state.recipes.length]);

  const hasMore = state.status === 'success' && state.recipes.length < state.total;

  return { ...state, hasMore, loadMore, retry: setAttempt };
}
