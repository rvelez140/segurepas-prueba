import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';
import { Express } from 'express';

/**
 * Inicializa Sentry para monitoreo de errores y performance
 */
export function initSentry(app: Express): void {
  const sentryDsn = process.env.SENTRY_DSN;

  // Solo inicializar Sentry si el DSN está configurado
  if (!sentryDsn) {
    console.warn('⚠️  SENTRY_DSN no configurado. Sentry deshabilitado.');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // Enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // Enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      // Enable Profiling
      new ProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% en producción, 100% en desarrollo
    // Profiling
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // Configurar release para tracking de versiones
    release: process.env.npm_package_version || '1.0.0',
    // Configuración de breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Filtrar breadcrumbs sensibles
      if (breadcrumb.category === 'http') {
        // No registrar tokens de autenticación
        if (breadcrumb.data?.url?.includes('password') || breadcrumb.data?.url?.includes('token')) {
          return null;
        }
      }
      return breadcrumb;
    },
    // Filtrar eventos sensibles antes de enviarlos
    beforeSend(event) {
      // Remover información sensible de headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // No enviar errores de validación (4xx) excepto 401/403
      if (event.contexts?.response?.status_code) {
        const status = event.contexts.response.status_code;
        if (status >= 400 && status < 500 && status !== 401 && status !== 403) {
          return null;
        }
      }

      return event;
    },
  });

  console.log('✅ Sentry inicializado correctamente');
}

/**
 * Middleware de Sentry para Express
 * Debe usarse ANTES de las rutas
 */
export const sentryRequestHandler = Sentry.Handlers.requestHandler();

/**
 * Middleware de tracing de Sentry
 * Debe usarse ANTES de las rutas
 */
export const sentryTracingHandler = Sentry.Handlers.tracingHandler();

/**
 * Middleware de manejo de errores de Sentry
 * Debe usarse DESPUÉS de las rutas
 */
export const sentryErrorHandler = Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capturar todos los errores 500 y superiores
    if (error.status && error.status >= 500) {
      return true;
    }
    // Capturar errores no controlados
    if (!error.status) {
      return true;
    }
    return false;
  },
});

/**
 * Capturar excepción manualmente
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capturar mensaje informativo
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
): void {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

export default Sentry;
