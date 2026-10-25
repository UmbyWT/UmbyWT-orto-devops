import { Link } from 'react-router';
import StatusMessage from '../components/StatusMessage.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Pagina non trovata');

  return (
    <div className="container" style={{ paddingTop: '2.5rem' }}>
      <StatusMessage title="Questa pagina non esiste">
        <p>Forse il link è sbagliato o la pagina è stata spostata.</p>
        <Link to="/" className="btn btn-primary">
          Torna alla ricerca
        </Link>
      </StatusMessage>
    </div>
  );
}
