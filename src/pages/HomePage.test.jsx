import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getRecipe, searchRecipes } from '../api/recipes.js';
import { renderApp } from '../test/renderWithProviders.jsx';

vi.mock('../api/recipes.js', () => ({ searchRecipes: vi.fn(), getRecipe: vi.fn(), PAGE_SIZE: 12 }));

const page = (from, count, total = 30) => ({
  recipes: Array.from({ length: count }, (_, i) => ({ id: from + i, title: `Ricetta ${from + i}`, image: null })),
  total,
});

describe('ricerca dalla home', () => {
  beforeEach(() => {
    searchRecipes.mockReset();
    getRecipe.mockReset();
  });

  it('senza ricerca non chiama l\'API e spiega come funziona', () => {
    renderApp('/');

    expect(searchRecipes).not.toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Come funziona' })).toBeInTheDocument();
  });

  it('un suggerimento avvia la ricerca e mostra le schede', async () => {
    searchRecipes.mockResolvedValue(page(1, 12));
    renderApp('/');

    await userEvent.click(screen.getByRole('button', { name: 'curry' }));

    expect(await screen.findByRole('heading', { name: '30 ricette per "curry"' })).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(12);
    expect(searchRecipes).toHaveBeenCalledWith(expect.objectContaining({ query: 'curry', type: '' }));
  });

  it('Mostra altre ricette chiede la pagina successiva e la aggiunge', async () => {
    searchRecipes.mockResolvedValueOnce(page(1, 12)).mockResolvedValueOnce(page(13, 12));
    renderApp('/?q=pasta');

    await userEvent.click(await screen.findByRole('button', { name: 'Mostra altre ricette' }));

    await waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(24));
    expect(searchRecipes).toHaveBeenLastCalledWith(expect.objectContaining({ query: 'pasta', offset: 12 }));
    expect(screen.getByText('Ne vedi 24 su 30')).toBeInTheDocument();
  });

  it('quando le ricette sono finite il pulsante sparisce', async () => {
    searchRecipes.mockResolvedValue(page(1, 5, 5));
    renderApp('/?q=pasta');

    expect(await screen.findByText('Ne vedi 5 su 5')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mostra altre ricette' })).not.toBeInTheDocument();
  });

  it('nessun risultato: suggerisce di cambiare parola', async () => {
    searchRecipes.mockResolvedValue({ recipes: [], total: 0 });
    renderApp('/?q=zucca');

    expect(await screen.findByRole('heading', { name: 'Nessuna ricetta per "zucca"' })).toBeInTheDocument();
  });

  it('errore: mostra il messaggio e Riprova rifà la ricerca', async () => {
    searchRecipes.mockRejectedValueOnce({ response: { status: 402 } }).mockResolvedValueOnce(page(1, 3, 3));
    renderApp('/?q=pasta');

    expect(await screen.findByRole('alert')).toHaveTextContent('finite le richieste gratuite');

    await userEvent.click(screen.getByRole('button', { name: 'Riprova' }));
    expect(await screen.findAllByRole('article')).toHaveLength(3);
  });
});
