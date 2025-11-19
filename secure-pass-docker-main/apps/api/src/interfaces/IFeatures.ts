import { Document, Types } from 'mongoose';

/**
 * Módulos/Servicios disponibles en el sistema
 */
export enum SystemModule {
  VISITS = 'visits',                    // Gestión de visitas
  RESIDENTS = 'residents',              // Gestión de residentes
  GUARDS = 'guards',                    // Gestión de guardias
  REPORTS = 'reports',                  // Generación de reportes
  QR_CODES = 'qr_codes',               // Códigos QR
  EMAIL_NOTIFICATIONS = 'email_notifications', // Notificaciones email
  IMAGE_UPLOAD = 'image_upload',       // Subida de imágenes
  VISIT_HISTORY = 'visit_history',     // Historial de visitas
  ANALYTICS = 'analytics',             // Analytics y estadísticas
  MOBILE_APP = 'mobile_app',           // Acceso app móvil
  API_ACCESS = 'api_access',           // Acceso a API REST
  CUSTOM_BRANDING = 'custom_branding', // Branding personalizado
  ADVANCED_PERMISSIONS = 'advanced_permissions', // Permisos avanzados
  AUDIT_LOGS = 'audit_logs',           // Logs de auditoría
  MULTI_LOCATION = 'multi_location',   // Múltiples ubicaciones
  INTEGRATIONS = 'integrations',       // Integraciones externas
}

/**
 * Configuración de un módulo para una empresa
 */
export interface IModuleConfig {
  module: SystemModule;
  enabled: boolean;
  settings?: {
    [key: string]: any; // Configuración específica del módulo
  };
  enabledAt?: Date;
  disabledAt?: Date;
  enabledBy?: Types.ObjectId; // Usuario que habilitó
  disabledBy?: Types.ObjectId; // Usuario que deshabilitó
}

/**
 * Features habilitados para una empresa
 */
export interface ICompanyFeatures {
  companyId: Types.ObjectId;
  modules: IModuleConfig[];
  customModules?: {
    name: string;
    enabled: boolean;
    settings?: any;
  }[];
  updatedAt: Date;
  updatedBy?: Types.ObjectId;
}

/**
 * Configuración de features por defecto según plan
 */
export const DEFAULT_FEATURES_BY_PLAN = {
  free: [
    SystemModule.VISITS,
    SystemModule.RESIDENTS,
    SystemModule.GUARDS,
    SystemModule.QR_CODES,
    SystemModule.VISIT_HISTORY,
  ],
  basic: [
    SystemModule.VISITS,
    SystemModule.RESIDENTS,
    SystemModule.GUARDS,
    SystemModule.QR_CODES,
    SystemModule.VISIT_HISTORY,
    SystemModule.EMAIL_NOTIFICATIONS,
    SystemModule.IMAGE_UPLOAD,
    SystemModule.REPORTS,
  ],
  premium: [
    SystemModule.VISITS,
    SystemModule.RESIDENTS,
    SystemModule.GUARDS,
    SystemModule.QR_CODES,
    SystemModule.VISIT_HISTORY,
    SystemModule.EMAIL_NOTIFICATIONS,
    SystemModule.IMAGE_UPLOAD,
    SystemModule.REPORTS,
    SystemModule.ANALYTICS,
    SystemModule.MOBILE_APP,
    SystemModule.API_ACCESS,
    SystemModule.CUSTOM_BRANDING,
    SystemModule.AUDIT_LOGS,
  ],
  enterprise: Object.values(SystemModule), // Todos los módulos
};

/**
 * Información de módulos disponibles
 */
export const MODULE_INFO: Record<SystemModule, { name: string; description: string; category: string }> = {
  [SystemModule.VISITS]: {
    name: 'Gestión de Visitas',
    description: 'Autorizar y gestionar visitas',
    category: 'Core',
  },
  [SystemModule.RESIDENTS]: {
    name: 'Gestión de Residentes',
    description: 'Administrar residentes',
    category: 'Core',
  },
  [SystemModule.GUARDS]: {
    name: 'Gestión de Guardias',
    description: 'Administrar guardias de seguridad',
    category: 'Core',
  },
  [SystemModule.REPORTS]: {
    name: 'Reportes',
    description: 'Generar reportes y PDFs',
    category: 'Features',
  },
  [SystemModule.QR_CODES]: {
    name: 'Códigos QR',
    description: 'Generación y validación de QR',
    category: 'Core',
  },
  [SystemModule.EMAIL_NOTIFICATIONS]: {
    name: 'Notificaciones Email',
    description: 'Envío de emails automatizados',
    category: 'Features',
  },
  [SystemModule.IMAGE_UPLOAD]: {
    name: 'Subida de Imágenes',
    description: 'Subir fotos de visitantes y vehículos',
    category: 'Features',
  },
  [SystemModule.VISIT_HISTORY]: {
    name: 'Historial de Visitas',
    description: 'Ver historial completo de visitas',
    category: 'Core',
  },
  [SystemModule.ANALYTICS]: {
    name: 'Analytics',
    description: 'Estadísticas y análisis avanzado',
    category: 'Premium',
  },
  [SystemModule.MOBILE_APP]: {
    name: 'App Móvil',
    description: 'Acceso desde aplicación móvil',
    category: 'Premium',
  },
  [SystemModule.API_ACCESS]: {
    name: 'Acceso API',
    description: 'Acceso a API REST completa',
    category: 'Premium',
  },
  [SystemModule.CUSTOM_BRANDING]: {
    name: 'Branding Personalizado',
    description: 'Logos y colores personalizados',
    category: 'Premium',
  },
  [SystemModule.ADVANCED_PERMISSIONS]: {
    name: 'Permisos Avanzados',
    description: 'Control granular de permisos',
    category: 'Premium',
  },
  [SystemModule.AUDIT_LOGS]: {
    name: 'Logs de Auditoría',
    description: 'Historial completo de cambios',
    category: 'Premium',
  },
  [SystemModule.MULTI_LOCATION]: {
    name: 'Múltiples Ubicaciones',
    description: 'Gestionar varias ubicaciones',
    category: 'Enterprise',
  },
  [SystemModule.INTEGRATIONS]: {
    name: 'Integraciones',
    description: 'Integraciones con sistemas externos',
    category: 'Enterprise',
  },
};
