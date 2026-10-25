import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleRequest } from './app.js';

const ENV = { SPOONACULAR_API_KEY: 'chiave-di-prova', APP_ENV: 'test' };

const get = (path, env = ENV, fetchImpl) =>
  handleRequest(new Request(`http://localhost${path}`), env, fetchImpl);

function upstream(status, body = {}) {
  return vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

describe('GET /api/health', () => {
  it('risponde 200 se la chiave è configurata', async () => {
    const res = await get('/api/health');
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ status: 'ok', service: 'orto-api', environment: 'test' });
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('risponde 503 senza chiave, così UptimeRobot se ne accorge', async () => {
    const res = await get('/api/health', {});
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ status: 'error', problem: 'SPOONACULAR_API_KEY mancante' });
  });

  it('non mostra mai la chiave', async () => {
    const res = await get('/api/health');
    expect(await res.text()).not.toContain('chiave-di-prova');
  });
});

describe('GET /api/search', () => {
  let fetchMock;
  beforeEach(() => {
    fetchMock = upstream(200, { results: [], totalResults: 0 });
  });

  it('chiede a Spoonacular solo ricette vegetariane con procedimento', async () => {
    const res = await get('/api/search?query=pasta&type=dessert&offset=12', ENV, fetchMock);
    expect(res.status).toBe(200);

    const url = fetchMock.mock.calls[0][0];
    expect(url.pathname).toBe('/recipes/complexSearch');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      query: 'pasta',
      type: 'dessert',
      diet: 'vegetarian',
      instructionsRequired: 'true',
      number: '12',
      offset: '12',
    });
  });

  it('il browser non può togliere il filtro vegetariano', async () => {
    await get('/api/search?query=steak&diet=&instructionsRequired=false', ENV, fetchMock);
    const url = fetchMock.mock.calls[0][0];
    expect(url.searchParams.get('diet')).toBe('vegetarian');
    expect(url.searchParams.get('instructionsRequired')).toBe('true');
  });

  it('manda la chiave nell\'header e non nell\'indirizzo', async () => {
    await get('/api/search?query=pasta', ENV, fetchMock);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url.toString()).not.toContain('chiave-di-prova');
    expect(options.headers['x-api-key']).toBe('chiave-di-prova');
  });

  it('mette in cache sulla CDN solo le risposte buone', async () => {
    const res = await get('/api/search?query=pasta', ENV, fetchMock);
    expect(res.headers.get('cache-control')).toContain('s-maxage=86400');
  });

  it('rifiuta richieste senza testo o con parametri fuori misura', async () => {
    expect((await get('/api/search', ENV, fetchMock)).status).toBe(400);
    expect((await get('/api/search?query=pasta&offset=-1', ENV, fetchMock)).status).toBe(400);
    expect((await get('/api/search?query=pasta&number=500', ENV, fetchMock)).status).toBe(400);
    expect((await get('/api/search?query=pasta&type=DROP%20TABLE;', ENV, fetchMock)).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('senza chiave risponde 401 e non chiama Spoonacular', async () => {
    const res = await get('/api/search?query=pasta', {}, fetchMock);
    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('GET /api/recipe', () => {
  it('chiede il dettaglio senza dati nutrizionali', async () => {
    const fetchMock = upstream(200, { id: 657933, title: 'Ratatouille Pasta' });
    const res = await get('/api/recipe?id=657933', ENV, fetchMock);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 657933, title: 'Ratatouille Pasta' });
    const url = fetchMock.mock.calls[0][0];
    expect(url.pathname).toBe('/recipes/657933/information');
    expect(url.searchParams.get('includeNutrition')).toBe('false');
  });

  it('accetta solo id numerici', async () => {
    const fetchMock = upstream(200);
    expect((await get('/api/recipe?id=../../admin', ENV, fetchMock)).status).toBe(400);
    expect((await get('/api/recipe', ENV, fetchMock)).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('errori di Spoonacular', () => {
  it.each([401, 402, 404, 429])('passa al frontend lo stato %i', async (status) => {
    const res = await get('/api/recipe?id=1', ENV, upstream(status));
    expect(res.status).toBe(status);
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('trasforma gli errori imprevisti in 502', async () => {
    const res = await get('/api/recipe?id=1', ENV, upstream(500));
    expect(res.status).toBe(502);
  });

  it('se Spoonacular non risponde restituisce 504', async () => {
    const res = await get('/api/recipe?id=1', ENV, vi.fn().mockRejectedValue(new Error('timeout')));
    expect(res.status).toBe(504);
  });
});

describe('rotte e metodi', () => {
  it('risponde 404 sugli endpoint che non esistono', async () => {
    expect((await get('/api/recipes/complexSearch')).status).toBe(404);
  });

  it('accetta solo GET e HEAD', async () => {
    const res = await handleRequest(new Request('http://localhost/api/health', { method: 'POST' }), ENV);
    expect(res.status).toBe(405);
  });
});
