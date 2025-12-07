// Setup para tests - Se ejecuta antes de todos los tests

// Mock de variables de entorno necesarias para tests
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test-key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test-secret';
process.env.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'test-stripe-key';

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
