import { describe, expect, it } from 'vitest';
import { formatAmount, formatMinutes, scaleAmount } from './format.js';

describe('scaleAmount', () => {
  it('ricalcola la quantità per un altro numero di porzioni', () => {
    expect(scaleAmount(372, 4, 5)).toBe(465);
    expect(scaleAmount(372, 4, 2)).toBe(186);
    expect(scaleAmount(1, 4, 6)).toBe(1.5);
  });

  it('restituisce null se manca la quantità o le porzioni di partenza', () => {
    expect(scaleAmount(null, 4, 2)).toBeNull();
    expect(scaleAmount(100, 0, 2)).toBeNull();
  });
});

describe('formatAmount', () => {
  it('arrotonda alla decina sopra 100', () => {
    expect(formatAmount(465)).toBe('470');
    expect(formatAmount(186)).toBe('190');
    expect(formatAmount(1250)).toBe('1250');
  });

  it('arrotonda all\'unità tra 10 e 100', () => {
    expect(formatAmount(12.4)).toBe('12');
    expect(formatAmount(99.6)).toBe('100');
  });

  it('sotto 10 tiene un decimale con la virgola', () => {
    expect(formatAmount(1.5)).toBe('1,5');
    expect(formatAmount(2.25)).toBe('2,3');
    expect(formatAmount(4)).toBe('4');
    expect(formatAmount(0.333)).toBe('0,3');
  });

  it('senza quantità restituisce una stringa vuota', () => {
    expect(formatAmount(null)).toBe('');
  });
});

describe('formatMinutes', () => {
  it('scrive minuti e ore', () => {
    expect(formatMinutes(45)).toBe('45 min');
    expect(formatMinutes(60)).toBe('1 h');
    expect(formatMinutes(75)).toBe('1 h 15 min');
    expect(formatMinutes(0)).toBe('');
  });
});
