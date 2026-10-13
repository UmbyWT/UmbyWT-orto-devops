import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRecipe } from '../api/recipes.js';
import ratatouille from '../test/fixtures/recipe-657933.json';
import { renderApp } from '../test/renderWithProviders.jsx';
import { toRecipeDetail } from '../utils/recipe.js';

vi.mock('../api/recipes.js', () => ({ searchRecipes: vi.fn(), getRecipe: vi.fn(), PAGE_SIZE: 12 }));

const recipe = toRecipeDetail(ratatouille);

describe('pagina della ricetta', () => {
  beforeEach(() => {
    getRecipe.mockReset();
  });

  it('mostra titolo, tempi, ingredienti e passaggi', async () => {
    getRecipe.mockResolvedValue(recipe);
    renderApp('/ricetta/657933');

    expect(await screen.findByRole('heading', { level: 1, name: 'Ratatouille Pasta' })).toBeInTheDocument();
    expect(getRecipe).toHaveBeenCalledWith('657933', expect.anything());
    expect(screen.getByText('Pronta in 45 min')).toBeInTheDocument();
    expect(screen.getByText('Vegetariana')).toBeInTheDocument();
    const ingredients = within(await screen.findByRole('region', { name: 'Ingredienti' }));
    expect(await ingredients.findAllByRole('checkbox')).toHaveLength(12);
    expect(ingredients.getByText('370 g zucchini')).toBeInTheDocument();

    const steps = within(screen.getByRole('region', { name: 'Procedimento' }));
    expect(steps.getAllByRole('listitem')).toHaveLength(6);
  });

  it('cambiando le porzioni le dosi si ricalcolano', async () => {
    getRecipe.mockResolvedValue(recipe);
    renderApp('/ricetta/657933');

    expect(await screen.findByText('370 g zucchini')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Una porzione in più' }));
    await userEvent.click(screen.getByRole('button', { name: 'Una porzione in più' }));

    expect(screen.getByText('6 porzioni')).toBeInTheDocument();
    expect(screen.getByText('560 g zucchini')).toBeInTheDocument();
  });

  it('salvare nei preferiti aggiorna il contatore nell\'header', async () => {
    getRecipe.mockResolvedValue(recipe);
    renderApp('/ricetta/657933');

    await userEvent.click(await screen.findByRole('button', { name: 'Salva nei preferiti' }));

    expect(screen.getByRole('button', { name: 'Salvata nei preferiti' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: /Preferiti/ })).toHaveTextContent('1');
  });

  it('una ricetta non vegetariana non viene mostrata', async () => {
    getRecipe.mockResolvedValue({ ...recipe, isVegetarian: false });
    renderApp('/ricetta/657933');

    expect(await screen.findByRole('heading', { name: 'Questa ricetta non è vegetariana' })).toBeInTheDocument();
    expect(screen.queryByText('Ingredienti')).not.toBeInTheDocument();
  });

  it('senza passaggi rimanda al sito originale', async () => {
    getRecipe.mockResolvedValue({ ...recipe, steps: [] });
    renderApp('/ricetta/657933');

    expect(await screen.findByText(/il procedimento è solo sul sito originale/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leggilo su foodista.com' })).toHaveAttribute('href', recipe.sourceUrl);
  });

  it('un id non numerico mostra la pagina non trovata senza chiamare l\'API', () => {
    renderApp('/ricetta/ciao');

    expect(screen.getByRole('heading', { name: 'Questa pagina non esiste' })).toBeInTheDocument();
    expect(getRecipe).not.toHaveBeenCalled();
  });

  it('errore di rete: messaggio e Riprova', async () => {
    getRecipe.mockRejectedValueOnce({ code: 'ERR_NETWORK' }).mockResolvedValueOnce(recipe);
    renderApp('/ricetta/657933');

    expect(await screen.findByRole('alert')).toHaveTextContent('non risponde');
    await userEvent.click(screen.getByRole('button', { name: 'Riprova' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Ratatouille Pasta' })).toBeInTheDocument();
  });
});

describe('pagina dei preferiti', () => {
  it('vuota invita a cercare', () => {
    renderApp('/preferiti');
    expect(screen.getByRole('heading', { name: 'Non hai ancora salvato ricette' })).toBeInTheDocument();
  });

  it('mostra le ricette salvate in precedenza', () => {
    localStorage.setItem('orto:preferiti', JSON.stringify([{ id: 1, title: 'Curry di ceci', image: null }]));
    renderApp('/preferiti');

    expect(screen.getByRole('heading', { name: 'Curry di ceci' })).toBeInTheDocument();
    expect(screen.getByText('1 ricetta salvata su questo dispositivo.')).toBeInTheDocument();
  });
});
