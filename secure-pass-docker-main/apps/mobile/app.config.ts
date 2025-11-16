import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

// Define el tipo para tus variables de entorno
type ExtraConfig = {
  apiUrl: string;
  nodeEnv: 'development' | 'production' | 'test';
};

export default ({ config }: ConfigContext): ExpoConfig => {
  // Asegura que las propiedades obligatorias tengan valores
  const baseConfig: ExpoConfig = {
    ...config,
    name: config.name || 'MyApp',
    slug: config.slug || 'my-app',
    extra: {
      apiUrl: process.env.API_URL || 'https://localhost:8000',
      nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    },
  };

  return baseConfig;
};