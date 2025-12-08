import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Express, Request, Response, NextFunction } from 'express';

export const initSentry = (app: Express) => {
  // Solo inicializar Sentry si hay un DSN configurado
  const sentryDsn = process.env.SENTRY_DSN;

  if (!sentryDsn) {
    console.log('⚠️  Sentry DSN no configurado. Monitoreo de errores deshabilitado.');
    console.log('   Para habilitar Sentry, configura SENTRY_DSN en el archivo .env');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // Integración de Profiling
      nodeProfilingIntegration(),
    ],
    // Tasa de muestreo para transacciones de performance
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Tasa de muestreo para profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Configuración de release
    release: process.env.SENTRY_RELEASE || 'securepass-api@1.0.0',
    // Filtrar información sensible
    beforeSend(event, _hint) {
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

export const setupSentryErrorHandler = (app: Express) => {
  // Middleware de error personalizado que envía a Sentry
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    // Capturar error en Sentry
    Sentry.captureException(err);

    console.error('Error capturado:', err);

    res.status(err.status || 500).json({
      status: 'error',
      message: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  });
};

export default Sentry;
