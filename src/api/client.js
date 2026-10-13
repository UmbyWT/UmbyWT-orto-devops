import axios from 'axios';

const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;

export const hasApiKey = Boolean(apiKey);

// Unica istanza di Axios per tutta l'app: indirizzo, timeout e chiave
// sono impostati qui e non nei componenti
export const client = axios.create({
  baseURL: 'https://api.spoonacular.com',
  timeout: 10000,
  params: { apiKey },
});
