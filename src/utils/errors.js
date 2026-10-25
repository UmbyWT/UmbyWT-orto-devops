// Traduce gli errori di Axios in messaggi da mostrare a chi usa il sito.
// Gli stati arrivano dal nostro backend, che inoltra quelli di Spoonacular.
export function getErrorMessage(error) {
  const status = error?.response?.status;

  if (status === 401) {
    return 'La chiave API di Spoonacular manca o non è valida.';
  }
  if (status === 402) {
    return 'Per oggi sono finite le richieste gratuite a Spoonacular. Il contatore si azzera ogni notte: riprova domani.';
  }
  if (status === 404) {
    return 'Questa ricetta non esiste o è stata rimossa.';
  }
  if (status === 429) {
    return 'Troppe richieste in poco tempo. Aspetta qualche secondo e riprova.';
  }
  if (status === 502 || status === 504 || error?.code === 'ECONNABORTED' || !error?.response) {
    return 'Spoonacular non risponde. Controlla la connessione e riprova.';
  }
  return 'Qualcosa è andato storto nel caricamento. Riprova tra poco.';
}

// Quali errori meritano una segnalazione su Sentry. Quelli che dipendono
// da chi usa il sito (ricetta inesistente, rete assente, ricerca annullata)
// no: farebbero solo rumore. Quelli che dicono che il servizio è rotto sì.
export function classifyApiError(error) {
  const status = error?.response?.status;

  if (status === 401) return { report: true, level: 'error', kind: 'chiave-api' };
  if (status === 402) return { report: true, level: 'warning', kind: 'quota-esaurita' };
  if (status >= 500) return { report: true, level: 'error', kind: 'backend' };
  return { report: false };
}
