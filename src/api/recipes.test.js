import { beforeEach, describe, expect, it, vi } from 'vitest';
import search from '../test/fixtures/search-pasta.json';
import ratatouille from '../test/fixtures/recipe-657933.json';
import { client } from './client.js';
import { getRecipe, PAGE_SIZE, searchRecipes } from './recipes.js';

vi.mock('./client.js', () => ({ client: { get: vi.fn() } }));

describe('searchRecipes', () => {
  beforeEach(() => {
    client.get.mockReset();
    client.get.mockResolvedValue({ data: search });
  });

  it('chiede al backend 12 ricette alla volta', async () => {
    await searchRecipes({ query: 'pasta' });

    expect(client.get).toHaveBeenCalledWith('/search', {
      params: { query: 'pasta', number: PAGE_SIZE, offset: 0 },
      signal: undefined,
    });
  });

  it('aggiunge la portata solo se è stata scelta', async () => {
    await searchRecipes({ query: 'cake', type: 'dessert', offset: 12 });

    expect(client.get.mock.calls[0][1].params).toMatchObject({ type: 'dessert', offset: 12 });
  });

  it('restituisce schede pulite e il totale', async () => {
    const { recipes, total } = await searchRecipes({ query: 'pasta' });

    expect(total).toBe(80);
    expect(recipes).toHaveLength(4);
    expect(recipes[0]).toEqual({
      id: 657933,
      title: 'Ratatouille Pasta',
      image: 'https://img.spoonacular.com/recipes/657933-556x370.jpg',
    });
  });

  it('la stessa ricerca nella stessa sessione non richiama l\'API', async () => {
    await searchRecipes({ query: 'pasta' });
    await searchRecipes({ query: 'pasta' });
    await searchRecipes({ query: 'pasta', offset: 12 });

    expect(client.get).toHaveBeenCalledTimes(2);
  });

  it('lascia passare gli errori a chi chiama', async () => {
    client.get.mockRejectedValueOnce({ response: { status: 402 } });

    await expect(searchRecipes({ query: 'curry' })).rejects.toEqual({ response: { status: 402 } });
  });
});

describe('getRecipe', () => {
  it('chiede il dettaglio al backend e restituisce la ricetta pulita', async () => {
    client.get.mockReset();
    client.get.mockResolvedValue({ data: ratatouille });

    const recipe = await getRecipe('657933');

    expect(client.get).toHaveBeenCalledWith('/recipe', {
      params: { id: '657933' },
      signal: undefined,
    });
    expect(recipe.title).toBe('Ratatouille Pasta');
    expect(recipe.ingredients).toHaveLength(12);
  });
});
