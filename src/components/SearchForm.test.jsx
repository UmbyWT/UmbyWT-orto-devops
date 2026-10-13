import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchForm from './SearchForm.jsx';

describe('SearchForm', () => {
  it('invia il testo senza spazi in più e la portata scelta', async () => {
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} />);

    await userEvent.selectOptions(screen.getByLabelText('Portata'), 'soup');
    await userEvent.type(screen.getByRole('searchbox'), '  pumpkin ');
    await userEvent.click(screen.getByRole('button', { name: 'Cerca' }));

    expect(onSearch).toHaveBeenLastCalledWith({ query: 'pumpkin', type: 'soup' });
  });

  it('con il campo vuoto non cerca e spiega cosa scrivere', async () => {
    const onSearch = vi.fn();
    render(<SearchForm onSearch={onSearch} />);

    await userEvent.click(screen.getByRole('button', { name: 'Cerca' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByText('Scrivi un ingrediente o il nome di un piatto.')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveFocus();
  });

  it('cambiare portata dopo una ricerca aggiorna subito i risultati', async () => {
    const onSearch = vi.fn();
    render(<SearchForm initialQuery="pasta" onSearch={onSearch} />);

    await userEvent.selectOptions(screen.getByLabelText('Portata'), 'main course');

    expect(onSearch).toHaveBeenCalledWith({ query: 'pasta', type: 'main course' });
  });

  it('si allinea quando la ricerca cambia da fuori', () => {
    const { rerender } = render(<SearchForm initialQuery="pasta" onSearch={vi.fn()} />);
    rerender(<SearchForm initialQuery="curry" onSearch={vi.fn()} />);

    expect(screen.getByRole('searchbox')).toHaveValue('curry');
  });
});
