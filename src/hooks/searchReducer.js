export const initialSearchState = {
  status: 'idle', // idle | loading | success | error
  recipes: [],
  total: 0,
  isLoadingMore: false,
  error: null,
};

export function searchReducer(state, action) {
  switch (action.type) {
    case 'start':
      return { ...initialSearchState, status: 'loading' };
    case 'success':
      return { ...state, status: 'success', recipes: action.recipes, total: action.total };
    case 'moreStart':
      return { ...state, isLoadingMore: true, error: null };
    case 'moreSuccess':
      return {
        ...state,
        isLoadingMore: false,
        // l'API a volte ripete una ricetta tra una pagina e l'altra
        recipes: [
          ...state.recipes,
          ...action.recipes.filter((recipe) => !state.recipes.some((r) => r.id === recipe.id)),
        ],
        total: action.total,
      };
    case 'error':
      return { ...state, status: 'error', isLoadingMore: false, error: action.error };
    case 'moreError':
      // le ricette già trovate restano, l'errore compare sotto
      return { ...state, isLoadingMore: false, error: action.error };
    case 'reset':
      return initialSearchState;
    default:
      return state;
  }
}
