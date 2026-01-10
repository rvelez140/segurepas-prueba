import 'dotenv/config';
import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * SecurePass Mobile - Configuracion de Expo
 * ==========================================
 * Configuracion completa para iOS, Android y Web
 *
 * Build Commands:
 * - Development: eas build --profile development --platform all
 * - Preview (APK): eas build --profile preview --platform android
 * - Production iOS: eas build --profile production --platform ios
 * - Production Android: eas build --profile production --platform android
 */

// Tipo para variables de entorno
type ExtraConfig = {
  apiUrl: string;
  nodeEnv: 'development' | 'production' | 'staging' | 'test';
  eas: {
    projectId: string;
  };
};

// Version de la aplicacion
const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '1';

export default ({ config }: ConfigContext): ExpoConfig => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    ...config,
    name: 'SecurePass',
    slug: 'securepass-mobile',
    version: APP_VERSION,
    orientation: 'portrait',
    icon: './src/assets/icon.png',
    userInterfaceStyle: 'automatic',

    // Configuracion de Splash Screen
    splash: {
      image: './src/assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#3498db',
    },

    // Esquema de deep linking
    scheme: 'securepass',

    // Configuracion de assets
    assetBundlePatterns: ['**/*'],

    // =====================
    // CONFIGURACION iOS
    // =====================
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.securepass.mobile',
      buildNumber: BUILD_NUMBER,
      infoPlist: {
        // Permisos de camara
        NSCameraUsageDescription: 'SecurePass necesita acceso a la camara para escanear codigos QR y tomar fotos de visitantes.',
        // Permisos de galeria
        NSPhotoLibraryUsageDescription: 'SecurePass necesita acceso a la galeria para seleccionar fotos de perfil.',
        NSPhotoLibraryAddUsageDescription: 'SecurePass necesita permiso para guardar fotos en tu galeria.',
        // Permisos de ubicacion (opcional)
        NSLocationWhenInUseUsageDescription: 'SecurePass usa tu ubicacion para verificar el acceso a la residencia.',
        // Permisos de Face ID
        NSFaceIDUsageDescription: 'SecurePass usa Face ID para autenticacion segura.',
        // Background modes
        UIBackgroundModes: ['fetch', 'remote-notification'],
      },
      config: {
        usesNonExemptEncryption: false,
      },
      // Asociacion de dominios para deep links
      associatedDomains: [
        'applinks:securepass.com',
        'applinks:*.securepass.com',
      ],
    },

    // =====================
    // CONFIGURACION ANDROID
    // =====================
    android: {
      adaptiveIcon: {
        foregroundImage: './src/assets/adaptive-icon.png',
        backgroundColor: '#3498db',
      },
      package: 'com.securepass.mobile',
      versionCode: parseInt(BUILD_NUMBER),
      // Permisos de Android
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'VIBRATE',
        'RECEIVE_BOOT_COMPLETED',
        'USE_BIOMETRIC',
        'USE_FINGERPRINT',
        'INTERNET',
        'ACCESS_NETWORK_STATE',
      ],
      // Configuracion de Google Services
      googleServicesFile: isProduction
        ? './google-services-prod.json'
        : './google-services.json',
      // Intent filters para deep links
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: '*.securepass.com',
              pathPrefix: '/app',
            },
            {
              scheme: 'securepass',
              host: '*',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },

    // =====================
    // CONFIGURACION WEB
    // =====================
    web: {
      bundler: 'metro',
      favicon: './src/assets/favicon.png',
      name: 'SecurePass',
      shortName: 'SecurePass',
      description: 'Sistema de control de acceso y gestion de visitantes',
      themeColor: '#3498db',
      backgroundColor: '#ffffff',
    },

    // =====================
    // PLUGINS Y PERMISOS
    // =====================
    plugins: [
      // Camara con permisos
      [
        'expo-camera',
        {
          cameraPermission: 'SecurePass necesita acceso a la camara para escanear codigos QR.',
          microphonePermission: 'SecurePass necesita acceso al microfono para grabar videos.',
          recordAudioAndroid: false,
        },
      ],
      // Selector de imagenes
      [
        'expo-image-picker',
        {
          photosPermission: 'SecurePass necesita acceso a tus fotos para seleccionar imagenes de perfil.',
          cameraPermission: 'SecurePass necesita acceso a la camara para tomar fotos.',
        },
      ],
      // Escaner de codigos de barras
      [
        'expo-barcode-scanner',
        {
          cameraPermission: 'SecurePass necesita acceso a la camara para escanear codigos QR de visitantes.',
        },
      ],
      // Build properties para optimizacion
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            minSdkVersion: 24,
            buildToolsVersion: '34.0.0',
            kotlinVersion: '1.9.0',
            enableProguardInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,
          },
          ios: {
            deploymentTarget: '14.0',
            useFrameworks: 'static',
          },
        },
      ],
    ],

    // =====================
    // CONFIGURACION EXTRA
    // =====================
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:48721/api',
      nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'staging' | 'test') || 'development',
      eas: {
        projectId: process.env.EAS_PROJECT_ID || 'your-eas-project-id',
      },
    },

    // =====================
    // EXPO UPDATES (OTA)
    // =====================
    updates: {
      enabled: isProduction,
      fallbackToCacheTimeout: 30000,
      url: 'https://u.expo.dev/your-eas-project-id',
    },

    // =====================
    // NUEVA ARQUITECTURA
    // =====================
    newArchEnabled: true,

    // =====================
    // CONFIGURACION DE OWNER
    // =====================
    owner: 'securepass-team',

    // =====================
    // RUNTIME VERSION
    // =====================
    runtimeVersion: {
      policy: 'appVersion',
    },
  };
};
