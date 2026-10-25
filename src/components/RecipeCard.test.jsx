import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import RecipeCard from './RecipeCard.jsx';

const recipe = { id: 657933, title: 'Ratatouille Pasta', image: 'https://img.spoonacular.com/recipes/657933-556x370.jpg' };

describe('RecipeCard', () => {
  it('mostra titolo e immagine e porta alla pagina della ricetta', () => {
    renderWithProviders(<RecipeCard recipe={recipe} />);

    expect(screen.getByRole('heading', { name: 'Ratatouille Pasta' })).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/ricetta/657933');
    expect(document.querySelector('img')).toHaveAttribute('src', recipe.image);
  });

  it('il cuore salva e toglie la ricetta dai preferiti', async () => {
    renderWithProviders(<RecipeCard recipe={recipe} />);
    const heart = screen.getByRole('button', { name: 'Salva Ratatouille Pasta nei preferiti' });

    await userEvent.click(heart);
    expect(heart).toHaveAttribute('aria-pressed', 'true');
    expect(JSON.parse(localStorage.getItem('orto:preferiti'))).toEqual([recipe]);

    await userEvent.click(heart);
    expect(heart).toHaveAttribute('aria-pressed', 'false');
    expect(JSON.parse(localStorage.getItem('orto:preferiti'))).toEqual([]);
  });

  it('senza immagine mostra un segnaposto', () => {
    renderWithProviders(<RecipeCard recipe={{ ...recipe, image: null }} />);
    expect(document.querySelector('img')).toBeNull();
  });
});
