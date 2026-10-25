// Il backend di Orto. Tiene la chiave di Spoonacular sul server e inoltra
// solo le due chiamate che servono al sito: la ricerca e il dettaglio di
// una ricetta. Tutto il resto risponde 404.
//
// La logica usa Request e Response standard, così lo stesso codice gira
// in due posti: nel container Docker (server/index.js) e nelle funzioni
// serverless di Vercel (cartella api/).

const SPOONACULAR_URL = 'https://api.spoonacular.com';
const UPSTREAM_TIMEOUT_MS = 8000;

// Le risposte buone restano in cache sulla CDN di Vercel per un giorno:
// la stessa ricetta chiesta da cento persone costa un punto solo.
const CACHE_OK = 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800';
const NO_STORE = 'no-store';

function json(status, body, cacheControl = NO_STORE) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function getApiKey(env) {
  const key = env.SPOONACULAR_API_KEY?.trim();
  return key || null;
}

function intInRange(value, { min, max, fallback }) {
  if (value === null || value === '') return fallback;
  if (!/^\d+$/.test(value)) return null;
  const n = Number(value);
  return n >= min && n <= max ? n : null;
}

// Chiamata a Spoonacular. La chiave va nell'header x-api-key e non
// nell'indirizzo, così non finisce nei log di nessun proxy.
async function callSpoonacular(path, params, env, fetchImpl) {
  const apiKey = getApiKey(env);
  if (!apiKey) {
    return json(401, { error: 'Chiave API di Spoonacular non configurata sul server.' });
  }

  const url = new URL(path, SPOONACULAR_URL);
  for (const [name, value] of Object.entries(params)) {
    url.searchParams.set(name, String(value));
  }

  let upstream;
  try {
    upstream = await fetchImpl(url, {
      headers: { 'x-api-key': apiKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    console.error(`[api] Spoonacular non raggiungibile: ${error.name}`);
    return json(504, { error: 'Spoonacular non risponde.' });
  }

  if (upstream.ok) {
    return json(200, await upstream.json(), CACHE_OK);
  }

  // 401 chiave sbagliata, 402 punti del giorno finiti, 404 ricetta che non
  // esiste, 429 troppe richieste: il frontend ha un messaggio per ognuno
  if ([401, 402, 404, 429].includes(upstream.status)) {
    console.warn(`[api] Spoonacular ha risposto ${upstream.status} su ${path}`);
    return json(upstream.status, { error: `Spoonacular ha risposto ${upstream.status}.` });
  }

  console.error(`[api] errore inatteso da Spoonacular: ${upstream.status} su ${path}`);
  return json(502, { error: 'Risposta inattesa da Spoonacular.' });
}

function health(env) {
  const ok = Boolean(getApiKey(env));
  const body = {
    status: ok ? 'ok' : 'error',
    service: 'orto-api',
    environment: env.APP_ENV ?? env.VERCEL_ENV ?? 'development',
    time: new Date().toISOString(),
  };
  if (!ok) body.problem = 'SPOONACULAR_API_KEY mancante';
  return json(ok ? 200 : 503, body);
}

function search(searchParams, env, fetchImpl) {
  const query = (searchParams.get('query') ?? '').trim();
  if (!query || query.length > 100) {
    return json(400, { error: 'Il parametro query è obbligatorio (massimo 100 caratteri).' });
  }

  const type = searchParams.get('type') ?? '';
  if (type && !/^[a-z ]{1,30}$/.test(type)) {
    return json(400, { error: 'Portata non valida.' });
  }

  const offset = intInRange(searchParams.get('offset'), { min: 0, max: 900, fallback: 0 });
  const number = intInRange(searchParams.get('number'), { min: 1, max: 24, fallback: 12 });
  if (offset === null || number === null) {
    return json(400, { error: 'offset o number fuori dai limiti.' });
  }

  const params = {
    query,
    // il vincolo vegetariano sta qui, sul server: dal browser non si toglie
    diet: 'vegetarian',
    instructionsRequired: true,
    number,
    offset,
  };
  if (type) params.type = type;

  return callSpoonacular('/recipes/complexSearch', params, env, fetchImpl);
}

function recipe(searchParams, env, fetchImpl) {
  const id = searchParams.get('id') ?? '';
  if (!/^\d{1,9}$/.test(id)) {
    return json(400, { error: 'Id della ricetta non valido.' });
  }
  return callSpoonacular(`/recipes/${id}/information`, { includeNutrition: false }, env, fetchImpl);
}

export async function handleRequest(request, env = process.env, fetchImpl = fetch) {
  const { pathname, searchParams } = new URL(request.url);
  const route = pathname.replace(/\/+$/, '');

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return json(405, { error: 'Metodo non permesso.' });
  }

  switch (route) {
    case '/api/health':
      return health(env);
    case '/api/search':
      return search(searchParams, env, fetchImpl);
    case '/api/recipe':
      return recipe(searchParams, env, fetchImpl);
    default:
      return json(404, { error: 'Endpoint inesistente.' });
  }
}
