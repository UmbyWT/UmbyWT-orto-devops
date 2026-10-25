import { useState } from 'react';
import StatusMessage from '../components/StatusMessage.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

// Pagina di servizio per il progetto DevOps: serve a controllare che
// Sentry riceva gli errori anche dal sito pubblicato. Non è nel menu,
// si apre a mano su /prova-errore.
export default function ErrorTestPage() {
  useDocumentTitle('Prova del monitoraggio');
  const [broken, setBroken] = useState(false);

  return (
    <div className="container" style={{ paddingTop: '2.5rem' }}>
      <StatusMessage title="Prova del monitoraggio degli errori">
        <p>
          Il pulsante rompe di proposito un componente. Il sito mostra la sua schermata di errore e, dopo qualche
          secondo, l'evento compare nella dashboard di Sentry.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => setBroken(true)}>
          Genera un errore di prova
        </button>
      </StatusMessage>
      {broken && <BrokenComponent />}
    </div>
  );
}

function BrokenComponent() {
  throw new Error('Errore di prova per Sentry: componente rotto di proposito');
}
