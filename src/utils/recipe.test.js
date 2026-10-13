import { describe, expect, it } from 'vitest';
import search from '../test/fixtures/search-pasta.json';
import ratatouille from '../test/fixtures/recipe-657933.json';
import noSteps from '../test/fixtures/recipe-716429.json';
import { cleanSummary, recipeImage, toRecipeCard, toRecipeDetail } from './recipe.js';

describe('recipeImage', () => {
  it('costruisce l\'indirizzo con id, misura e formato', () => {
    expect(recipeImage(657933, 'jpg')).toBe('https://img.spoonacular.com/recipes/657933-556x370.jpg');
    expect(recipeImage(657933, 'png', '636x393')).toBe('https://img.spoonacular.com/recipes/657933-636x393.png');
  });

  it('restituisce null se manca il formato', () => {
    expect(recipeImage(657933, undefined)).toBeNull();
  });
});

describe('toRecipeCard', () => {
  it('tiene id, titolo e un\'immagine più grande di quella della ricerca', () => {
    expect(toRecipeCard(search.results[0])).toEqual({
      id: 657933,
      title: 'Ratatouille Pasta',
      image: 'https://img.spoonacular.com/recipes/657933-556x370.jpg',
    });
  });

  it('senza immagine restituisce null', () => {
    expect(toRecipeCard({ id: 1, title: 'Senza foto' }).image).toBeNull();
  });
});

describe('toRecipeDetail', () => {
  const recipe = toRecipeDetail(ratatouille);

  it('legge i dati principali della ricetta', () => {
    expect(recipe).toMatchObject({
      id: 657933,
      title: 'Ratatouille Pasta',
      isVegetarian: true,
      readyInMinutes: 45,
      servings: 4,
      sourceName: 'foodista.com',
      image: 'https://img.spoonacular.com/recipes/657933-636x393.jpg',
    });
  });

  it('usa le misure metriche per gli ingredienti', () => {
    const zucchini = recipe.ingredients.find((ingredient) => ingredient.name === 'zucchini');
    expect(zucchini).toMatchObject({ amount: 372, unit: 'g' });
  });

  it('per gli ingredienti "quanto basta" non mostra una quantità', () => {
    const oil = recipe.ingredients.find((ingredient) => ingredient.original === 'Olive oil for sauteing');
    expect(oil).toMatchObject({ amount: null, unit: '' });
  });

  it('dà a ogni ingrediente una chiave diversa', () => {
    const keys = recipe.ingredients.map((ingredient) => ingredient.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('numera i passaggi del procedimento', () => {
    expect(recipe.steps).toHaveLength(6);
    expect(recipe.steps[0].number).toBe(1);
    expect(recipe.steps[0].text).toMatch(/^Saute the yellow onion/);
  });

  it('se l\'API non ha passaggi restituisce una lista vuota', () => {
    expect(toRecipeDetail(noSteps).steps).toEqual([]);
  });

  it('traduce le caratteristiche in etichette italiane', () => {
    expect(toRecipeDetail({ ...ratatouille, vegan: true, glutenFree: true }).badges).toEqual(['Vegana', 'Senza glutine']);
    expect(recipe.badges).toEqual([]);
  });

  it('segna come non vegetariana una ricetta con vegetarian false', () => {
    expect(toRecipeDetail({ ...ratatouille, vegetarian: false }).isVegetarian).toBe(false);
  });
});

describe('cleanSummary', () => {
  it('toglie i tag HTML e le frasi su punteggi, prezzi e ricette simili', () => {
    const text = cleanSummary(ratatouille.summary);

    expect(text).not.toMatch(/<|spoonacular score|similar recipes|per serving/i);
    expect(text).toMatch(/^Forget going out to eat/);
    expect(text).toContain('requires artichokes, seasoning, spaghetti, and garlic.');
  });

  it('con un riassunto vuoto restituisce una stringa vuota', () => {
    expect(cleanSummary('')).toBe('');
    expect(cleanSummary(undefined)).toBe('');
  });
});
