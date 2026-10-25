import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import * as Sentry from '@sentry/react';

import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto-slab/600.css';
import '@fontsource/roboto-slab/700.css';
import '@fontsource/roboto-slab/800.css';
import './styles/global.css';

import App from './App.jsx';
import { FavoritesProvider } from './context/FavoritesContext.jsx';
import { initSentry } from './monitoring/sentry.js';

// Sentry parte prima di React, così registra anche gli errori di avvio
initSentry();

// Gli errori che nessun ErrorBoundary intercetta arrivano comunque a Sentry
createRoot(document.getElementById('root'), {
  onUncaughtError: Sentry.reactErrorHandler(),
  onRecoverableError: Sentry.reactErrorHandler(),
}).render(
  <StrictMode>
    <BrowserRouter>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </BrowserRouter>
  </StrictMode>
);
