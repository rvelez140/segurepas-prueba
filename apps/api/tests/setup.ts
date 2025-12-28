// Setup para tests - Se ejecuta antes de todos los tests

// Mock de variables de entorno necesarias para tests
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
process.env.MONGO_ROOT_USER = process.env.MONGO_ROOT_USER || 'test';
process.env.MONGO_ROOT_PASSWORD = process.env.MONGO_ROOT_PASSWORD || 'test';
process.env.MONGO_DB_NAME = process.env.MONGO_DB_NAME || 'test_db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test-key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test-secret';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'test-stripe-key';
process.env.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'test-paypal-client';
process.env.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || 'test-paypal-secret';
process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'test-firebase';
process.env.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY || 'test-key';
process.env.FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL || 'test@test.com';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
process.env.REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
process.env.SMTP_HOST = process.env.SMTP_HOST || 'localhost';
process.env.SMTP_PORT = process.env.SMTP_PORT || '587';
process.env.SMTP_USER = process.env.SMTP_USER || 'test@test.com';
process.env.SMTP_PASSWORD = process.env.SMTP_PASSWORD || 'test-password';
process.env.SENTRY_DSN = process.env.SENTRY_DSN || 'https://test@sentry.io/test';

// Nota: Los tests actuales son básicos y no requieren conexión real a MongoDB
// Cuando se necesiten tests de integración, descomentar el siguiente código:

/*
import mongoose from 'mongoose';
import { env } from '../src/config/env';
import { User } from '../src/models/User';
import { Visit } from '../src/models/Visit';

beforeAll(async () => {
  await mongoose.connect(env.MONGODB_URI);
  await User.deleteMany({});
  await Visit.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});
*/
