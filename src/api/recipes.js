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

export async function searchRecipes({ query, type = '', offset = 0, signal } = {}) {
  const params = {
    query,
    diet: 'vegetarian', // solo ricette senza carne né pesce
    instructionsRequired: true, // niente ricette senza procedimento
    number: PAGE_SIZE,
    offset,
  };
  if (type) params.type = type;

  const data = await cachedGet('/recipes/complexSearch', params, signal);

  return {
    recipes: (data.results ?? []).map(toRecipeCard),
    total: data.totalResults ?? 0,
  };
}

export async function getRecipe(id, { signal } = {}) {
  const data = await cachedGet(`/recipes/${id}/information`, { includeNutrition: false }, signal);
  return toRecipeDetail(data);
}
