// Funzione serverless di Vercel per /api/health, controllata da UptimeRobot.
// La logica è in server/app.js, la stessa che gira nel container Docker.
import { handleRequest } from '../server/app.js';

export default {
  fetch: (request) => handleRequest(request, process.env),
};
