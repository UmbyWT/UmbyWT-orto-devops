import { describe, expect, it } from 'vitest';
import { classifyApiError, getErrorMessage } from './errors.js';

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

  it('se il backend non raggiunge Spoonacular lo dice', () => {
    expect(getErrorMessage(withStatus(502))).toMatch(/non risponde/);
    expect(getErrorMessage(withStatus(504))).toMatch(/non risponde/);
  });

  it('riconosce le troppe richieste', () => {
    expect(getErrorMessage(withStatus(429))).toMatch(/Troppe richieste/);
  });

  it('per gli altri errori dà un messaggio generico', () => {
    expect(getErrorMessage(withStatus(500))).toMatch(/Riprova tra poco/);
  });
});

describe('classifyApiError', () => {
  it('segnala a Sentry i problemi del servizio', () => {
    expect(classifyApiError(withStatus(401))).toMatchObject({ report: true, kind: 'chiave-api' });
    expect(classifyApiError(withStatus(402))).toMatchObject({ report: true, level: 'warning' });
    expect(classifyApiError(withStatus(502))).toMatchObject({ report: true, kind: 'backend' });
  });

  it('ignora gli errori che non dipendono dal servizio', () => {
    expect(classifyApiError(withStatus(404)).report).toBe(false);
    expect(classifyApiError({ code: 'ERR_NETWORK' }).report).toBe(false);
  });
});
