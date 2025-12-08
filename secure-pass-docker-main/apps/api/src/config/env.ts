import dotenv from 'dotenv';
dotenv.config();

// aqui valido variables no cargadas

const checkEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`La variable ${key} no está definida en .env`);
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
};
