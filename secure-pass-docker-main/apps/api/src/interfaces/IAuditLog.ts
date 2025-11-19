import { Document, Types } from 'mongoose';

/**
 * Tipos de acciones auditables
 */
export enum AuditAction {
  // Empresas
  COMPANY_CREATED = 'company.created',
  COMPANY_UPDATED = 'company.updated',
  COMPANY_DELETED = 'company.deleted',
  COMPANY_ACTIVATED = 'company.activated',
  COMPANY_DEACTIVATED = 'company.deactivated',

  // Suscripciones
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  SUBSCRIPTION_UPGRADED = 'subscription.upgraded',
  SUBSCRIPTION_DOWNGRADED = 'subscription.downgraded',

  // Features/Módulos
  FEATURE_ENABLED = 'feature.enabled',
  FEATURE_DISABLED = 'feature.disabled',
  FEATURE_CONFIGURED = 'feature.configured',

  // Usuarios
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_ROLE_CHANGED = 'user.role_changed',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_FAILED_LOGIN = 'user.failed_login',

  // Visitas
  VISIT_CREATED = 'visit.created',
  VISIT_UPDATED = 'visit.updated',
  VISIT_APPROVED = 'visit.approved',
  VISIT_DENIED = 'visit.denied',
  VISIT_ENTRY = 'visit.entry',
  VISIT_EXIT = 'visit.exit',

  // Branding
  LOGO_UPLOADED = 'logo.uploaded',
  LOGO_DELETED = 'logo.deleted',
  BRANDING_UPDATED = 'branding.updated',

  // Configuración
  SETTINGS_UPDATED = 'settings.updated',

  // Impersonación
  IMPERSONATION_START = 'impersonation.start',
  IMPERSONATION_END = 'impersonation.end',

  // Seguridad
  PASSWORD_CHANGED = 'password.changed',
  PASSWORD_RESET_REQUESTED = 'password.reset_requested',

  // Reportes
  REPORT_GENERATED = 'report.generated',
  REPORT_DOWNLOADED = 'report.downloaded',

  // Sistema
  SYSTEM_ERROR = 'system.error',
  SYSTEM_WARNING = 'system.warning',
}

/**
 * Categorías de acciones
 */
export enum AuditCategory {
  COMPANY = 'company',
  USER = 'user',
  VISIT = 'visit',
  SECURITY = 'security',
  CONFIGURATION = 'configuration',
  SYSTEM = 'system',
}

/**
 * Nivel de severidad del evento
 */
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Interfaz del modelo de AuditLog
 */
export interface IAuditLogInput {
  // Identificación del evento
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;

  // Contexto de la empresa
  company?: Types.ObjectId;

  // Actor (quién realizó la acción)
  actor: {
    userId?: Types.ObjectId;
    email?: string;
    role?: string;
    isImpersonating?: boolean; // Si es un admin impersonando
    impersonatedBy?: Types.ObjectId; // ID del admin que impersona
  };

  // Detalles del evento
  resource?: {
    type: string; // 'User', 'Visit', 'Company', etc.
    id?: Types.ObjectId;
    name?: string;
  };

  // Cambios realizados
  changes?: {
    before?: any; // Estado anterior
    after?: any; // Estado nuevo
  };

  // Metadata adicional
  metadata?: {
    ip?: string;
    userAgent?: string;
    location?: string;
    [key: string]: any;
  };

  // Descripción legible
  description: string;

  // Timestamp
  timestamp: Date;
}

export interface IAuditLog extends IAuditLogInput, Document {
  _id: Types.ObjectId;
}

/**
 * Helper para generar descripciones de eventos
 */
export const getAuditDescription = (action: AuditAction, details?: any): string => {
  const descriptions: Record<AuditAction, (d?: any) => string> = {
    [AuditAction.COMPANY_CREATED]: (d) => `Empresa "${d?.name}" creada`,
    [AuditAction.COMPANY_UPDATED]: (d) => `Empresa "${d?.name}" actualizada`,
    [AuditAction.COMPANY_DELETED]: (d) => `Empresa "${d?.name}" eliminada`,
    [AuditAction.COMPANY_ACTIVATED]: (d) => `Empresa "${d?.name}" activada`,
    [AuditAction.COMPANY_DEACTIVATED]: (d) => `Empresa "${d?.name}" desactivada`,

    [AuditAction.SUBSCRIPTION_UPDATED]: (d) => `Suscripción actualizada a plan ${d?.plan}`,
    [AuditAction.SUBSCRIPTION_UPGRADED]: (d) => `Suscripción mejorada a ${d?.newPlan}`,
    [AuditAction.SUBSCRIPTION_DOWNGRADED]: (d) => `Suscripción reducida a ${d?.newPlan}`,

    [AuditAction.FEATURE_ENABLED]: (d) => `Módulo "${d?.module}" habilitado`,
    [AuditAction.FEATURE_DISABLED]: (d) => `Módulo "${d?.module}" deshabilitado`,
    [AuditAction.FEATURE_CONFIGURED]: (d) => `Módulo "${d?.module}" configurado`,

    [AuditAction.USER_CREATED]: (d) => `Usuario "${d?.email}" creado con rol ${d?.role}`,
    [AuditAction.USER_UPDATED]: (d) => `Usuario "${d?.email}" actualizado`,
    [AuditAction.USER_DELETED]: (d) => `Usuario "${d?.email}" eliminado`,
    [AuditAction.USER_ROLE_CHANGED]: (d) => `Rol de "${d?.email}" cambiado de ${d?.oldRole} a ${d?.newRole}`,
    [AuditAction.USER_LOGIN]: (d) => `Usuario "${d?.email}" inició sesión`,
    [AuditAction.USER_LOGOUT]: (d) => `Usuario "${d?.email}" cerró sesión`,
    [AuditAction.USER_FAILED_LOGIN]: (d) => `Intento fallido de login para "${d?.email}"`,

    [AuditAction.VISIT_CREATED]: (d) => `Visita creada para ${d?.visitorName}`,
    [AuditAction.VISIT_UPDATED]: (d) => `Visita actualizada para ${d?.visitorName}`,
    [AuditAction.VISIT_APPROVED]: (d) => `Visita aprobada para ${d?.visitorName}`,
    [AuditAction.VISIT_DENIED]: (d) => `Visita denegada para ${d?.visitorName}`,
    [AuditAction.VISIT_ENTRY]: (d) => `Entrada registrada para ${d?.visitorName}`,
    [AuditAction.VISIT_EXIT]: (d) => `Salida registrada para ${d?.visitorName}`,

    [AuditAction.LOGO_UPLOADED]: () => 'Logo de empresa subido',
    [AuditAction.LOGO_DELETED]: () => 'Logo de empresa eliminado',
    [AuditAction.BRANDING_UPDATED]: () => 'Branding de empresa actualizado',

    [AuditAction.SETTINGS_UPDATED]: (d) => `Configuración actualizada: ${d?.setting}`,

    [AuditAction.IMPERSONATION_START]: (d) => `Admin comenzó a ver como empresa "${d?.companyName}"`,
    [AuditAction.IMPERSONATION_END]: (d) => `Admin terminó de ver como empresa "${d?.companyName}"`,

    [AuditAction.PASSWORD_CHANGED]: (d) => `Contraseña cambiada para "${d?.email}"`,
    [AuditAction.PASSWORD_RESET_REQUESTED]: (d) => `Reset de contraseña solicitado para "${d?.email}"`,

    [AuditAction.REPORT_GENERATED]: (d) => `Reporte generado: ${d?.reportType}`,
    [AuditAction.REPORT_DOWNLOADED]: (d) => `Reporte descargado: ${d?.reportType}`,

    [AuditAction.SYSTEM_ERROR]: (d) => `Error del sistema: ${d?.error}`,
    [AuditAction.SYSTEM_WARNING]: (d) => `Advertencia del sistema: ${d?.warning}`,
  };

  const descriptionFn = descriptions[action];
  return descriptionFn ? descriptionFn(details) : action;
};

/**
 * Helper para obtener categoría de una acción
 */
export const getCategoryFromAction = (action: AuditAction): AuditCategory => {
  if (action.startsWith('company.')) return AuditCategory.COMPANY;
  if (action.startsWith('user.') || action.startsWith('password.')) return AuditCategory.USER;
  if (action.startsWith('visit.')) return AuditCategory.VISIT;
  if (action.startsWith('impersonation.') || action.includes('login')) return AuditCategory.SECURITY;
  if (action.startsWith('feature.') || action.startsWith('settings.') || action.startsWith('branding.')) {
    return AuditCategory.CONFIGURATION;
  }
  return AuditCategory.SYSTEM;
};

/**
 * Helper para obtener severidad de una acción
 */
export const getSeverityFromAction = (action: AuditAction): AuditSeverity => {
  if (action === AuditAction.SYSTEM_CRITICAL || action.includes('deleted')) {
    return AuditSeverity.CRITICAL;
  }
  if (action === AuditAction.SYSTEM_ERROR || action.includes('failed')) {
    return AuditSeverity.ERROR;
  }
  if (action === AuditAction.SYSTEM_WARNING || action.includes('deactivated')) {
    return AuditSeverity.WARNING;
  }
  return AuditSeverity.INFO;
};
