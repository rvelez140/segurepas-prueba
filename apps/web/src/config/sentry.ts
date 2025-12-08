import * as Sentry from '@sentry/react';

export const initSentry = () => {
  const sentryDsn = process.env.REACT_APP_SENTRY_DSN;

  if (!sentryDsn) {
    console.log('⚠️  Sentry DSN no configurado. Monitoreo de errores deshabilitado.');
    console.log('   Para habilitar Sentry, configura REACT_APP_SENTRY_DSN en el archivo .env');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Tasa de muestreo para transacciones de performance
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Tasa de muestreo para session replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    // Configuración de release
    release: process.env.REACT_APP_SENTRY_RELEASE || 'securepass-web@1.0.0',
    // Filtrar información sensible
    beforeSend(event, hint) {
      // Remover información sensible de los eventos
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    },
  });

  console.log('✓ Sentry inicializado correctamente para monitoreo de errores');
};

export const ErrorBoundary = Sentry.ErrorBoundary;

export default Sentry;
