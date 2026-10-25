import { client } from './client.js';
import { readCache, writeCache } from '../utils/cache.js';
import { toRecipeCard, toRecipeDetail } from '../utils/recipe.js';

export const PAGE_SIZE = 12;

// Il piano gratuito di Spoonacular ha pochi punti al giorno: la stessa
// richiesta fatta due volte nella stessa sessione viene servita dalla cache
async function cachedGet(url, params, signal) {
  const key = `${url}?${new URLSearchParams(params)}`;
  const cached = readCache(key);
  if (cached) return cached;

  const { data } = await client.get(url, { params, signal });
  writeCache(key, data);
  return data;
}

// Il filtro vegetariano e l'obbligo del procedimento li aggiunge il
// backend (server/app.js): dal browser non si possono togliere
export async function searchRecipes({ query, type = '', offset = 0, signal } = {}) {
  const params = { query, number: PAGE_SIZE, offset };
  if (type) params.type = type;

  const data = await cachedGet('/search', params, signal);

  return {
    recipes: (data.results ?? []).map(toRecipeCard),
    total: data.totalResults ?? 0,
  };
}

export async function getRecipe(id, { signal } = {}) {
  const data = await cachedGet('/recipe', { id }, signal);
  return toRecipeDetail(data);
}
