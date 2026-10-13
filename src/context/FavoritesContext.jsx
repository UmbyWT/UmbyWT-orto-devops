import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
import { favoritesReducer } from './favoritesReducer.js';

const STORAGE_KEY = 'orto:preferiti';

export const FavoritesContext = createContext(null);

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// I preferiti servono in più punti lontani tra loro (schede, pagina della
// ricetta, header, pagina Preferiti): per questo stanno in un Context
export function FavoritesProvider({ children }) {
  const [favorites, dispatch] = useReducer(favoritesReducer, undefined, loadFavorites);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // navigazione privata o spazio pieno: restano solo in memoria
    }
  }, [favorites]);

  const toggleFavorite = useCallback((recipe) => dispatch({ type: 'toggle', recipe }), []);
  const removeFavorite = useCallback((id) => dispatch({ type: 'remove', id }), []);
  const isFavorite = useCallback((id) => favorites.some((recipe) => recipe.id === id), [favorites]);

  const value = useMemo(
    () => ({ favorites, toggleFavorite, removeFavorite, isFavorite }),
    [favorites, toggleFavorite, removeFavorite, isFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
