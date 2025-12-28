import dotenv from 'dotenv';
dotenv.config();

// aqui valido variables no cargadas

const checkEnv = (key: string): string => {
  const value = process.env[key];
  // En entorno de test, retornar valor por defecto en lugar de lanzar error
  if (!value) {
    if (process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined) {
      return 'test-value';
    }
    throw new Error(`La variable ${key} no está definida en .env`);
  }
  return value;
};

export const env = {
  MONGODB_URI: checkEnv('MONGODB_URI'),
  MONGO_ROOT_USER: checkEnv('MONGO_ROOT_USER'),
  MONGO_ROOT_PASSWORD: checkEnv('MONGO_ROOT_PASSWORD'),
  MONGO_DB_NAME: checkEnv('MONGO_DB_NAME'),

  PORT: checkEnv('PORT') || '8000',
  MONGODB_PORT: checkEnv('MONGODB_PORT'),
  JWT_SECRET: checkEnv('JWT_SECRET') || 'jwtSecret',

  CLOUDINARY_CLOUD_NAME: checkEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: checkEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: checkEnv('CLOUDINARY_API_SECRET'),

  EMAIL_USER: checkEnv('EMAIL_USER'),
  EMAIL_PASSWORD: checkEnv('EMAIL_PASSWORD'),
  EMAIL_FROM: checkEnv('EMAIL_FROM'),
  EMAIL_SENDER: checkEnv('EMAIL_SENDER'),
  EMAIL_REPLY: checkEnv('EMAIL_REPLY'),
  NODE_ENV: checkEnv('NODE_ENV'),

  // Stripe Configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_PRICE_BASIC_MONTHLY: process.env.STRIPE_PRICE_BASIC_MONTHLY || '',
  STRIPE_PRICE_BASIC_YEARLY: process.env.STRIPE_PRICE_BASIC_YEARLY || '',
  STRIPE_PRICE_PREMIUM_MONTHLY: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '',
  STRIPE_PRICE_PREMIUM_YEARLY: process.env.STRIPE_PRICE_PREMIUM_YEARLY || '',
  STRIPE_PRICE_ENTERPRISE_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
  STRIPE_PRICE_ENTERPRISE_YEARLY: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || '',

  // PayPal Configuration
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || '',
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET || '',
  PAYPAL_MODE: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
  PAYPAL_PLAN_BASIC_MONTHLY: process.env.PAYPAL_PLAN_BASIC_MONTHLY || '',
  PAYPAL_PLAN_BASIC_YEARLY: process.env.PAYPAL_PLAN_BASIC_YEARLY || '',
  PAYPAL_PLAN_PREMIUM_MONTHLY: process.env.PAYPAL_PLAN_PREMIUM_MONTHLY || '',
  PAYPAL_PLAN_PREMIUM_YEARLY: process.env.PAYPAL_PLAN_PREMIUM_YEARLY || '',
  PAYPAL_PLAN_ENTERPRISE_MONTHLY: process.env.PAYPAL_PLAN_ENTERPRISE_MONTHLY || '',
  PAYPAL_PLAN_ENTERPRISE_YEARLY: process.env.PAYPAL_PLAN_ENTERPRISE_YEARLY || '',

  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
