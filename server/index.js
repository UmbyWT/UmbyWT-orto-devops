// Server Node per l'ambiente locale e per il container Docker.
// Non ha dipendenze: usa solo node:http e passa ogni richiesta ad app.js.
import { createServer } from 'node:http';
import { handleRequest } from './app.js';

const port = Number(process.env.PORT ?? 3001);

const server = createServer(async (req, res) => {
  const started = performance.now();

  try {
    const request = new Request(new URL(req.url, `http://${req.headers.host ?? 'localhost'}`), {
      method: req.method,
    });
    const response = await handleRequest(request, process.env);
    const body = req.method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer());

    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(body);
  } catch (error) {
    console.error('[api] errore nel server:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Errore interno.' }));
  } finally {
    // una riga per richiesta: metodo, percorso senza query, stato, durata
    const path = req.url.split('?')[0];
    const ms = Math.round(performance.now() - started);
    console.log(`[api] ${req.method} ${path} ${res.statusCode} ${ms}ms`);
  }
});

server.listen(port, () => {
  console.log(`[api] in ascolto sulla porta ${port}`);
  if (!process.env.SPOONACULAR_API_KEY) {
    console.warn('[api] SPOONACULAR_API_KEY non impostata: /api/health risponderà 503');
  }
});

// docker stop manda SIGTERM: si chiudono le connessioni e si esce puliti
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    console.log(`[api] ricevuto ${signal}, chiudo`);
    server.close(() => process.exit(0));
  });
}
