import { describe, expect, it } from 'vitest';
import { initialSearchState, searchReducer } from './searchReducer.js';

const recipes = (...ids) => ids.map((id) => ({ id, title: `Ricetta ${id}` }));

describe('searchReducer', () => {
  it('una nuova ricerca svuota i risultati precedenti', () => {
    const before = { ...initialSearchState, status: 'success', recipes: recipes(1, 2), total: 2 };
    expect(searchReducer(before, { type: 'start' })).toEqual({ ...initialSearchState, status: 'loading' });
  });

  it('salva risultati e totale', () => {
    const state = searchReducer({ ...initialSearchState, status: 'loading' }, { type: 'success', recipes: recipes(1, 2), total: 80 });
    expect(state).toMatchObject({ status: 'success', total: 80 });
    expect(state.recipes).toHaveLength(2);
  });

  it('Mostra altre aggiunge in coda senza duplicati', () => {
    const before = { ...initialSearchState, status: 'success', recipes: recipes(1, 2), total: 80, isLoadingMore: true };
    const state = searchReducer(before, { type: 'moreSuccess', recipes: recipes(2, 3, 4), total: 80 });

    expect(state.recipes.map((recipe) => recipe.id)).toEqual([1, 2, 3, 4]);
    expect(state.isLoadingMore).toBe(false);
  });

  it('un errore su Mostra altre tiene le ricette già trovate', () => {
    const before = { ...initialSearchState, status: 'success', recipes: recipes(1, 2), total: 80, isLoadingMore: true };
    const state = searchReducer(before, { type: 'moreError', error: 'rete assente' });

    expect(state).toMatchObject({ status: 'success', isLoadingMore: false, error: 'rete assente' });
    expect(state.recipes).toHaveLength(2);
  });

  it('un errore sulla ricerca porta lo stato in errore', () => {
    const state = searchReducer({ ...initialSearchState, status: 'loading' }, { type: 'error', error: 'chiave sbagliata' });
    expect(state).toMatchObject({ status: 'error', error: 'chiave sbagliata' });
  });
});
