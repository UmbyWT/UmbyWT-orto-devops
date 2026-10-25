import * as Sentry from '@sentry/react';
import { Link } from 'react-router';
import StatusMessage from './StatusMessage.jsx';

// Se un componente si rompe durante il render, invece della pagina bianca
// compare questo riquadro. Sentry.ErrorBoundary manda l'errore a Sentry
// insieme all'albero dei componenti in cui è successo.
export default function AppErrorBoundary({ children }) {
  return (
    <Sentry.ErrorBoundary fallback={({ eventId, resetError }) => <Fallback eventId={eventId} onReset={resetError} />}>
      {children}
    </Sentry.ErrorBoundary>
  );
}

function Fallback({ eventId, onReset }) {
  return (
    <div className="container" style={{ paddingTop: '2.5rem' }}>
      <StatusMessage title="Si è rotto qualcosa" tone="error" role="alert">
        <p>Questa pagina ha avuto un problema. L'errore è stato registrato e lo sistemeremo.</p>
        {eventId && (
          <p>
            Codice dell'errore: <code>{eventId}</code>
          </p>
        )}
        <Link to="/" className="btn btn-primary" onClick={onReset}>
          Torna alla ricerca
        </Link>
      </StatusMessage>
    </div>
  );
}
