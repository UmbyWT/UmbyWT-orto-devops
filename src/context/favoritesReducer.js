// Reducer dei preferiti: funzione pura, la provo nei test senza React

export function favoritesReducer(state, action) {
  switch (action.type) {
    case 'toggle': {
      const exists = state.some((recipe) => recipe.id === action.recipe.id);
      if (exists) return state.filter((recipe) => recipe.id !== action.recipe.id);

      // salvo solo quello che serve per la scheda, non la ricetta intera
      const { id, title, image } = action.recipe;
      return [{ id, title, image }, ...state];
    }
    case 'remove':
      return state.filter((recipe) => recipe.id !== action.id);
    case 'clear':
      return [];
    default:
      return state;
  }
}
