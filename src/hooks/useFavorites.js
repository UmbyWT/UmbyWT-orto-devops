import { useContext } from 'react';
import { FavoritesContext } from '../context/FavoritesContext.jsx';

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites va usato dentro <FavoritesProvider>');
  }
  return context;
}
