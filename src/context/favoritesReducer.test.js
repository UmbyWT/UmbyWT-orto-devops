import { describe, expect, it } from 'vitest';
import { favoritesReducer } from './favoritesReducer.js';

const pasta = { id: 1, title: 'Pasta', image: 'pasta.jpg', ingredients: ['tanti'] };
const curry = { id: 2, title: 'Curry', image: 'curry.jpg' };

describe('favoritesReducer', () => {
  it('toggle aggiunge in cima e salva solo id, titolo e immagine', () => {
    const state = favoritesReducer([curry], { type: 'toggle', recipe: pasta });
    expect(state).toEqual([{ id: 1, title: 'Pasta', image: 'pasta.jpg' }, curry]);
  });

  it('toggle su una ricetta già salvata la toglie', () => {
    const state = favoritesReducer([pasta, curry], { type: 'toggle', recipe: pasta });
    expect(state).toEqual([curry]);
  });

  it('remove toglie per id', () => {
    expect(favoritesReducer([pasta, curry], { type: 'remove', id: 2 })).toEqual([pasta]);
  });

  it('clear svuota la lista', () => {
    expect(favoritesReducer([pasta, curry], { type: 'clear' })).toEqual([]);
  });

  it('non modifica lo stato di partenza', () => {
    const start = [curry];
    favoritesReducer(start, { type: 'toggle', recipe: pasta });
    expect(start).toEqual([curry]);
  });

  it('ignora le azioni sconosciute', () => {
    const start = [pasta];
    expect(favoritesReducer(start, { type: 'boh' })).toBe(start);
  });
});
