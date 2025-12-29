import { ApiConfig, IApiConfigModel } from '../models/ApiConfig';
import { ApiProvider } from '../interfaces/IApiConfig';

/**
 * Helper para obtener configuración de APIs con fallback a variables de entorno
 * Este módulo proporciona funciones síncronas y asíncronas para obtener configuración
 */

// Cache en memoria para configuraciones (se actualiza periódicamente)
let configCache: Map<ApiProvider, { values: Record<string, string>; timestamp: number }> = new Map();
const CACHE_TTL = 60 * 1000; // 1 minuto

/**
 * Obtiene la configuración de un proveedor de forma asíncrona
 * Usa caché para mejorar rendimiento
 */
export async function getApiConfig(provider: ApiProvider): Promise<Record<string, string>> {
  const cached = configCache.get(provider);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.values;
  }

  try {
    const values = await (ApiConfig as IApiConfigModel).getConfigWithFallback(provider);
    configCache.set(provider, { values, timestamp: Date.now() });
    return values;
  } catch {
    // Si hay error (ej: DB no conectada), usar variables de entorno
    return getEnvConfig(provider);
  }
}

/**
 * Verifica si un proveedor está disponible (configurado)
 */
export async function isApiAvailable(provider: ApiProvider): Promise<boolean> {
  try {
    return await (ApiConfig as IApiConfigModel).isProviderAvailable(provider);
  } catch {
    // Si hay error, verificar solo variables de entorno
    return isEnvConfigured(provider);
  }
}

/**
 * Obtiene configuración solo de variables de entorno
 */
function getEnvConfig(provider: ApiProvider): Record<string, string> {
  const envMappings: Record<ApiProvider, string[]> = {
    [ApiProvider.STRIPE]: [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'STRIPE_PRICE_BASIC_MONTHLY',
      'STRIPE_PRICE_BASIC_YEARLY',
      'STRIPE_PRICE_PREMIUM_MONTHLY',
      'STRIPE_PRICE_PREMIUM_YEARLY',
      'STRIPE_PRICE_ENTERPRISE_MONTHLY',
      'STRIPE_PRICE_ENTERPRISE_YEARLY',
    ],
    [ApiProvider.PAYPAL]: [
      'PAYPAL_CLIENT_ID',
      'PAYPAL_CLIENT_SECRET',
      'PAYPAL_MODE',
      'PAYPAL_PLAN_BASIC_MONTHLY',
      'PAYPAL_PLAN_BASIC_YEARLY',
      'PAYPAL_PLAN_PREMIUM_MONTHLY',
      'PAYPAL_PLAN_PREMIUM_YEARLY',
      'PAYPAL_PLAN_ENTERPRISE_MONTHLY',
      'PAYPAL_PLAN_ENTERPRISE_YEARLY',
    ],
    [ApiProvider.CLOUDINARY]: [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
    ],
    [ApiProvider.EMAIL]: [
      'EMAIL_USER',
      'EMAIL_PASSWORD',
      'EMAIL_FROM',
      'EMAIL_SENDER',
      'EMAIL_REPLY',
    ],
    [ApiProvider.FIREBASE]: [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
    ],
    [ApiProvider.SENTRY]: [
      'SENTRY_DSN',
      'SENTRY_DSN_FRONTEND',
      'SENTRY_RELEASE',
    ],
  };

  const values: Record<string, string> = {};
  const keys = envMappings[provider] || [];

  for (const key of keys) {
    values[key] = process.env[key] || '';
  }

  return values;
}

/**
 * Verifica si un proveedor está configurado via variables de entorno
 */
function isEnvConfigured(provider: ApiProvider): boolean {
  const requiredKeys: Record<ApiProvider, string[]> = {
    [ApiProvider.STRIPE]: ['STRIPE_SECRET_KEY'],
    [ApiProvider.PAYPAL]: ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'],
    [ApiProvider.CLOUDINARY]: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'],
    [ApiProvider.EMAIL]: ['EMAIL_USER', 'EMAIL_PASSWORD'],
    [ApiProvider.FIREBASE]: ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL'],
    [ApiProvider.SENTRY]: ['SENTRY_DSN'],
  };

  const keys = requiredKeys[provider] || [];
  return keys.every((key) => {
    const value = process.env[key];
    return value && value.length > 0;
  });
}

/**
 * Limpia el caché de configuración
 */
export function clearConfigCache(): void {
  configCache.clear();
}

/**
 * Wrapper para ejecutar operaciones que dependen de una API
 * Retorna null si la API no está disponible, evitando errores
 */
export async function withApiOrNull<T>(
  provider: ApiProvider,
  operation: (config: Record<string, string>) => Promise<T>
): Promise<T | null> {
  const isAvailable = await isApiAvailable(provider);
  if (!isAvailable) {
    console.warn(`API ${provider} no está configurada. La operación será omitida.`);
    return null;
  }

  const config = await getApiConfig(provider);
  return operation(config);
}

/**
 * Wrapper que lanza error si la API no está disponible
 */
export async function withApiOrThrow<T>(
  provider: ApiProvider,
  operation: (config: Record<string, string>) => Promise<T>
): Promise<T> {
  const isAvailable = await isApiAvailable(provider);
  if (!isAvailable) {
    throw new Error(`API ${provider} no está configurada. Por favor configure las credenciales en el panel de administración.`);
  }

  const config = await getApiConfig(provider);
  return operation(config);
}
