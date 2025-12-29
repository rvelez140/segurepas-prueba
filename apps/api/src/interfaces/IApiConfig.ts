import { Document } from 'mongoose';

export enum ApiProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  CLOUDINARY = 'cloudinary',
  EMAIL = 'email',
  FIREBASE = 'firebase',
  SENTRY = 'sentry',
}

export interface IApiConfigField {
  key: string;
  value: string;
  isSecret: boolean;
  label: string;
  description?: string;
  required: boolean;
}

export interface IApiConfig extends Document {
  provider: ApiProvider;
  displayName: string;
  description: string;
  isEnabled: boolean;
  isConfigured: boolean;
  fields: IApiConfigField[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IApiConfigInput {
  provider: ApiProvider;
  fields: { key: string; value: string }[];
  isEnabled?: boolean;
}

// Definición de campos por proveedor
export const API_PROVIDER_DEFINITIONS: Record<
  ApiProvider,
  {
    displayName: string;
    description: string;
    fields: Omit<IApiConfigField, 'value'>[];
  }
> = {
  [ApiProvider.STRIPE]: {
    displayName: 'Stripe',
    description: 'Procesamiento de pagos con tarjeta de crédito/débito',
    fields: [
      { key: 'STRIPE_SECRET_KEY', isSecret: true, label: 'Clave Secreta', required: true },
      { key: 'STRIPE_WEBHOOK_SECRET', isSecret: true, label: 'Webhook Secret', required: true },
      { key: 'STRIPE_PRICE_BASIC_MONTHLY', isSecret: false, label: 'Price ID - Básico Mensual', required: false },
      { key: 'STRIPE_PRICE_BASIC_YEARLY', isSecret: false, label: 'Price ID - Básico Anual', required: false },
      { key: 'STRIPE_PRICE_PREMIUM_MONTHLY', isSecret: false, label: 'Price ID - Premium Mensual', required: false },
      { key: 'STRIPE_PRICE_PREMIUM_YEARLY', isSecret: false, label: 'Price ID - Premium Anual', required: false },
      { key: 'STRIPE_PRICE_ENTERPRISE_MONTHLY', isSecret: false, label: 'Price ID - Enterprise Mensual', required: false },
      { key: 'STRIPE_PRICE_ENTERPRISE_YEARLY', isSecret: false, label: 'Price ID - Enterprise Anual', required: false },
    ],
  },
  [ApiProvider.PAYPAL]: {
    displayName: 'PayPal',
    description: 'Procesamiento de pagos con PayPal',
    fields: [
      { key: 'PAYPAL_CLIENT_ID', isSecret: false, label: 'Client ID', required: true },
      { key: 'PAYPAL_CLIENT_SECRET', isSecret: true, label: 'Client Secret', required: true },
      { key: 'PAYPAL_MODE', isSecret: false, label: 'Modo (sandbox/live)', required: true },
      { key: 'PAYPAL_PLAN_BASIC_MONTHLY', isSecret: false, label: 'Plan ID - Básico Mensual', required: false },
      { key: 'PAYPAL_PLAN_BASIC_YEARLY', isSecret: false, label: 'Plan ID - Básico Anual', required: false },
      { key: 'PAYPAL_PLAN_PREMIUM_MONTHLY', isSecret: false, label: 'Plan ID - Premium Mensual', required: false },
      { key: 'PAYPAL_PLAN_PREMIUM_YEARLY', isSecret: false, label: 'Plan ID - Premium Anual', required: false },
      { key: 'PAYPAL_PLAN_ENTERPRISE_MONTHLY', isSecret: false, label: 'Plan ID - Enterprise Mensual', required: false },
      { key: 'PAYPAL_PLAN_ENTERPRISE_YEARLY', isSecret: false, label: 'Plan ID - Enterprise Anual', required: false },
    ],
  },
  [ApiProvider.CLOUDINARY]: {
    displayName: 'Cloudinary',
    description: 'Almacenamiento y gestión de imágenes en la nube',
    fields: [
      { key: 'CLOUDINARY_CLOUD_NAME', isSecret: false, label: 'Cloud Name', required: true },
      { key: 'CLOUDINARY_API_KEY', isSecret: false, label: 'API Key', required: true },
      { key: 'CLOUDINARY_API_SECRET', isSecret: true, label: 'API Secret', required: true },
    ],
  },
  [ApiProvider.EMAIL]: {
    displayName: 'Email (Gmail/SMTP)',
    description: 'Envío de correos electrónicos y notificaciones',
    fields: [
      { key: 'EMAIL_USER', isSecret: false, label: 'Email de envío', required: true },
      { key: 'EMAIL_PASSWORD', isSecret: true, label: 'Contraseña de aplicación', required: true },
      { key: 'EMAIL_FROM', isSecret: false, label: 'Nombre del remitente', required: true },
      { key: 'EMAIL_SENDER', isSecret: false, label: 'Email remitente', required: false },
      { key: 'EMAIL_REPLY', isSecret: false, label: 'Email de respuesta', required: false },
    ],
  },
  [ApiProvider.FIREBASE]: {
    displayName: 'Firebase',
    description: 'Notificaciones push para dispositivos móviles',
    fields: [
      { key: 'FIREBASE_PROJECT_ID', isSecret: false, label: 'Project ID', required: true },
      { key: 'FIREBASE_PRIVATE_KEY', isSecret: true, label: 'Private Key (JSON)', required: true },
      { key: 'FIREBASE_CLIENT_EMAIL', isSecret: false, label: 'Client Email', required: true },
    ],
  },
  [ApiProvider.SENTRY]: {
    displayName: 'Sentry',
    description: 'Monitoreo de errores y performance',
    fields: [
      { key: 'SENTRY_DSN', isSecret: false, label: 'DSN Backend', required: true },
      { key: 'SENTRY_DSN_FRONTEND', isSecret: false, label: 'DSN Frontend', required: false },
      { key: 'SENTRY_RELEASE', isSecret: false, label: 'Release Version', required: false },
    ],
  },
};
