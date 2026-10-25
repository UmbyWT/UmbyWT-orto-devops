import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../test/renderWithProviders.jsx';

describe('pagina di prova degli errori', () => {
  afterEach(() => vi.restoreAllMocks());

  it('il pulsante rompe la pagina e compare il riquadro di errore, non la pagina bianca', async () => {
    // React stampa l'errore in console: qui è voluto
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderApp('/prova-errore');

    await userEvent.click(screen.getByRole('button', { name: 'Genera un errore di prova' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Si è rotto qualcosa');
    // header e footer restano: l'errore è confinato al contenuto
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('tornando alla ricerca il sito riparte', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderApp('/prova-errore');

    await userEvent.click(screen.getByRole('button', { name: 'Genera un errore di prova' }));
    await userEvent.click(await screen.findByRole('link', { name: 'Torna alla ricerca' }));

    expect(screen.getByRole('heading', { name: 'Cosa cuciniamo oggi?' })).toBeInTheDocument();
  });
});
