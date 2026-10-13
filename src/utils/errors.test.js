import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './errors.js';

const withStatus = (status) => ({ response: { status } });

describe('getErrorMessage', () => {
  it('riconosce la chiave sbagliata e i punti finiti', () => {
    expect(getErrorMessage(withStatus(401))).toMatch(/chiave API/);
    expect(getErrorMessage(withStatus(402))).toMatch(/finite le richieste gratuite/);
  });

  it('riconosce la ricetta inesistente', () => {
    expect(getErrorMessage(withStatus(404))).toMatch(/non esiste/);
  });

  it('senza risposta dal server parla di connessione', () => {
    expect(getErrorMessage({ code: 'ERR_NETWORK' })).toMatch(/connessione/);
    expect(getErrorMessage({ code: 'ECONNABORTED', response: undefined })).toMatch(/connessione/);
  });

  it('per gli altri errori dà un messaggio generico', () => {
    expect(getErrorMessage(withStatus(500))).toMatch(/Riprova tra poco/);
  });
});
