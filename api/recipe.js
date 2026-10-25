// Funzione serverless di Vercel per /api/recipe.
// La logica è in server/app.js, la stessa che gira nel container Docker.
import { handleRequest } from '../server/app.js';

export default {
  fetch: (request) => handleRequest(request, process.env),
};
