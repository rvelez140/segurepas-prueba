import { Document, Types } from "mongoose";

export enum AuditAction {
  // Autenticación
  LOGIN = "login",
  LOGOUT = "logout",
  LOGIN_FAILED = "login_failed",
  PASSWORD_CHANGE = "password_change",

  // Usuarios
  USER_CREATE = "user_create",
  USER_UPDATE = "user_update",
  USER_DELETE = "user_delete",

  // Visitas
  VISIT_AUTHORIZE = "visit_authorize",
  VISIT_ENTRY_APPROVE = "visit_entry_approve",
  VISIT_ENTRY_DENY = "visit_entry_deny",
  VISIT_EXIT = "visit_exit",
  VISIT_UPDATE = "visit_update",
  VISIT_DELETE = "visit_delete",
  VISIT_IMAGE_UPLOAD = "visit_image_upload",

  // Pagos
  PAYMENT_CREATE = "payment_create",
  PAYMENT_SUCCESS = "payment_success",
  PAYMENT_FAILED = "payment_failed",

  // Seguridad
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
}

export enum AuditSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

export interface IAuditLogInput {
  action: AuditAction;
  severity: AuditSeverity;
  user?: Types.ObjectId;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

export interface IAuditLog extends IAuditLogInput, Document {
  _id: Types.ObjectId;
  timestamp: Date;
}
