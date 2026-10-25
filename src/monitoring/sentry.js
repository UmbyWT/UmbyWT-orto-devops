import * as Sentry from '@sentry/react';
import { classifyApiError } from '../utils/errors.js';

// Il DSN arriva da una variabile d'ambiente letta durante la build.
// Senza DSN (test, sviluppo senza account) Sentry resta spento e le
// funzioni qui sotto non fanno nulla.
const dsn = import.meta.env.VITE_SENTRY_DSN;

export function initSentry() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    // development, staging o production: in Sentry si filtrano gli eventi
    environment: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
    // lo SHA del commit, passato dalla pipeline: dice quale deploy ha
    // introdotto un errore
    release: import.meta.env.VITE_APP_RELEASE || undefined,
    // niente indirizzi IP né altri dati personali
    sendDefaultPii: false,
  });
}

// Manda a Sentry solo gli errori delle API che indicano un servizio
// rotto (chiave sbagliata, quota finita, backend in errore).
export function reportApiError(error, context) {
  const { report, level, kind } = classifyApiError(error);
  if (!report) return;

  Sentry.withScope((scope) => {
    scope.setLevel(level);
    scope.setTag('api_error', kind);
    scope.setContext('richiesta', context);
    Sentry.captureException(error);
  });
}
