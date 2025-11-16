import { Document, Types } from 'mongoose';

/**
 * Define las categorías de recursos del sistema
 */
export enum PermissionResource {
  USERS = 'users',
  ROLES = 'roles',
  VISITS = 'visits',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  AUTHORIZATIONS = 'authorizations',
  DASHBOARD = 'dashboard'
}

/**
 * Define las acciones que se pueden realizar sobre un recurso
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage', // Acceso total al recurso
  EXECUTE = 'execute' // Para acciones especiales como generar reportes
}

/**
 * Interface para un permiso individual
 */
export interface IPermission extends Document {
  _id: Types.ObjectId;
  resource: PermissionResource; // Recurso sobre el que aplica el permiso
  action: PermissionAction; // Acción permitida
  description: string; // Descripción del permiso
  isSystem: boolean; // Indica si es un permiso del sistema (no se puede eliminar)
  createdAt: Date;
  updatedAt: Date;
}
