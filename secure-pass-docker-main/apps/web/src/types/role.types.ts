/**
 * Tipos para el sistema de roles y permisos
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

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  EXECUTE = 'execute'
}

export interface Permission {
  id: string;
  resource: PermissionResource;
  action: PermissionAction;
  description: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: Permission[] | string[];
  isSystem: boolean;
  isActive: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDTO {
  name: string;
  slug?: string;
  description: string;
  permissions: string[];
  color?: string;
}

export interface UpdateRoleDTO {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
  color?: string;
}

// Labels en español para los recursos
export const RESOURCE_LABELS: Record<PermissionResource, string> = {
  [PermissionResource.USERS]: 'Usuarios',
  [PermissionResource.ROLES]: 'Roles',
  [PermissionResource.VISITS]: 'Visitas',
  [PermissionResource.REPORTS]: 'Reportes',
  [PermissionResource.SETTINGS]: 'Configuración',
  [PermissionResource.AUTHORIZATIONS]: 'Autorizaciones',
  [PermissionResource.DASHBOARD]: 'Dashboard'
};

// Labels en español para las acciones
export const ACTION_LABELS: Record<PermissionAction, string> = {
  [PermissionAction.CREATE]: 'Crear',
  [PermissionAction.READ]: 'Ver',
  [PermissionAction.UPDATE]: 'Actualizar',
  [PermissionAction.DELETE]: 'Eliminar',
  [PermissionAction.MANAGE]: 'Gestión Completa',
  [PermissionAction.EXECUTE]: 'Ejecutar'
};
