import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import IngredientList, { ingredientLabel } from './IngredientList.jsx';
import ServingsStepper, { MAX_SERVINGS } from './ServingsStepper.jsx';

const zucchini = { key: 'a', name: 'zucchini', original: '3 cups Zucchini', amount: 372, unit: 'g' };
const oil = { key: 'b', name: 'olive oil', original: 'Olive oil for sauteing', amount: null, unit: '' };
const onion = { key: 'c', name: 'onion', original: '1 large onion', amount: 1, unit: 'large' };

describe('ingredientLabel', () => {
  it('ricalcola e formatta la quantità', () => {
    expect(ingredientLabel(zucchini, 4, 4)).toBe('370 g zucchini');
    expect(ingredientLabel(zucchini, 4, 6)).toBe('560 g zucchini');
    expect(ingredientLabel(onion, 4, 6)).toBe('1,5 large onion');
  });

  it('per i "quanto basta" usa il testo originale', () => {
    expect(ingredientLabel(oil, 4, 8)).toBe('Olive oil for sauteing');
  });
});

describe('IngredientList', () => {
  it('si può spuntare un ingrediente', async () => {
    render(<IngredientList ingredients={[zucchini, oil]} baseServings={4} servings={4} />);
    const checkbox = screen.getByRole('checkbox', { name: '370 g zucchini' });

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});

describe('ServingsStepper', () => {
  it('non scende sotto 1 e non sale sopra il massimo', () => {
    const { rerender } = render(<ServingsStepper value={1} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Una porzione in meno' })).toBeDisabled();
    expect(screen.getByText('1 porzione')).toBeInTheDocument();

    rerender(<ServingsStepper value={MAX_SERVINGS} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Una porzione in più' })).toBeDisabled();
  });

  it('avvisa del nuovo valore', async () => {
    const onChange = vi.fn();
    render(<ServingsStepper value={4} onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Una porzione in più' }));
    expect(onChange).toHaveBeenCalledWith(5);
  });
});
