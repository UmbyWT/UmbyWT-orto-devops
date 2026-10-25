import axios from 'axios';

// Unica istanza di Axios per tutta l'app. Le richieste vanno al nostro
// backend (/api), che aggiunge la chiave di Spoonacular lato server:
// nel JavaScript pubblicato non c'è nessuna chiave.
export const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
});
