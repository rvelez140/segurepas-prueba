import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/auth.types';
import { RoleService } from '../services/RoleService';
import { PermissionResource, PermissionAction } from '../interfaces/IPermission';
import User from '../models/User';

/**
 * Middleware para verificar si un usuario tiene un permiso específico
 */
export const permissionMiddleware = (resource: PermissionResource, action: PermissionAction) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      // Si el usuario tiene un roleId, verificar permisos por roleId
      if (user.roleId) {
        const hasPermission = await RoleService.hasPermission(
          user.roleId.toString(),
          resource,
          action
        );

        if (!hasPermission) {
          res.status(403).json({
            error: 'No tienes permisos suficientes para realizar esta acción',
            required: { resource, action }
          });
          return;
        }

        next();
        return;
      }

      // Fallback: Si no tiene roleId, usar el sistema antiguo de roles
      // Admin tiene acceso a todo
      if (user.role === 'admin') {
        next();
        return;
      }

      // Definir permisos básicos por rol antiguo
      const legacyPermissions = getLegacyRolePermissions(user.role);
      const hasPermission = legacyPermissions.some(
        (p) => p.resource === resource && (p.action === action || p.action === PermissionAction.MANAGE)
      );

      if (!hasPermission) {
        res.status(403).json({
          error: 'No tienes permisos suficientes para realizar esta acción',
          required: { resource, action }
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al verificar permisos' });
    }
  };
};

/**
 * Middleware para verificar múltiples permisos (el usuario debe tener al menos uno)
 */
export const anyPermissionMiddleware = (
  permissions: Array<{ resource: PermissionResource; action: PermissionAction }>
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ error: 'Autenticación requerida' });
        return;
      }

      // Si el usuario tiene un roleId
      if (user.roleId) {
        let hasAnyPermission = false;

        for (const perm of permissions) {
          const hasPermission = await RoleService.hasPermission(
            user.roleId.toString(),
            perm.resource,
            perm.action
          );

          if (hasPermission) {
            hasAnyPermission = true;
            break;
          }
        }

        if (!hasAnyPermission) {
          res.status(403).json({
            error: 'No tienes permisos suficientes para realizar esta acción',
            required: permissions
          });
          return;
        }

        next();
        return;
      }

      // Fallback para roles antiguos
      if (user.role === 'admin') {
        next();
        return;
      }

      const legacyPermissions = getLegacyRolePermissions(user.role);
      const hasAnyPermission = permissions.some((required) =>
        legacyPermissions.some(
          (p) => p.resource === required.resource &&
                 (p.action === required.action || p.action === PermissionAction.MANAGE)
        )
      );

      if (!hasAnyPermission) {
        res.status(403).json({
          error: 'No tienes permisos suficientes para realizar esta acción',
          required: permissions
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Error al verificar permisos' });
    }
  };
};

/**
 * Obtiene los permisos para roles legacy (residente, guardia)
 * Esto es para mantener compatibilidad con el sistema antiguo
 */
function getLegacyRolePermissions(
  role: string
): Array<{ resource: PermissionResource; action: PermissionAction }> {
  switch (role) {
    case 'residente':
      return [
        { resource: PermissionResource.AUTHORIZATIONS, action: PermissionAction.CREATE },
        { resource: PermissionResource.AUTHORIZATIONS, action: PermissionAction.READ },
        { resource: PermissionResource.AUTHORIZATIONS, action: PermissionAction.UPDATE },
        { resource: PermissionResource.VISITS, action: PermissionAction.READ },
        { resource: PermissionResource.DASHBOARD, action: PermissionAction.READ },
        { resource: PermissionResource.SETTINGS, action: PermissionAction.READ },
      ];

    case 'guardia':
      return [
        { resource: PermissionResource.VISITS, action: PermissionAction.READ },
        { resource: PermissionResource.VISITS, action: PermissionAction.UPDATE },
        { resource: PermissionResource.AUTHORIZATIONS, action: PermissionAction.READ },
        { resource: PermissionResource.USERS, action: PermissionAction.READ },
        { resource: PermissionResource.DASHBOARD, action: PermissionAction.READ },
      ];

    default:
      return [];
  }
}
