// Traduce gli errori di Axios in messaggi da mostrare a chi usa il sito
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
  if (error?.code === 'ECONNABORTED' || !error?.response) {
    return 'Spoonacular non risponde. Controlla la connessione e riprova.';
  }
  return 'Qualcosa è andato storto nel caricamento. Riprova tra poco.';
}
