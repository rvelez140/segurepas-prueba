import Permission from '../models/Permission';
import { IPermission, PermissionResource, PermissionAction } from '../interfaces/IPermission';
import { Types } from 'mongoose';

export class PermissionService {
  /**
   * Obtiene todos los permisos
   */
  static async findAll(): Promise<IPermission[]> {
    return await Permission.find().sort({ resource: 1, action: 1 });
  }

  /**
   * Obtiene un permiso por ID
   */
  static async findById(id: string): Promise<IPermission | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('ID de permiso inválido');
    }
    return await Permission.findById(id);
  }

  /**
   * Obtiene permisos por recurso
   */
  static async findByResource(resource: PermissionResource): Promise<IPermission[]> {
    return await Permission.find({ resource }).sort({ action: 1 });
  }

  /**
   * Crea un nuevo permiso
   */
  static async create(
    resource: PermissionResource,
    action: PermissionAction,
    description: string,
    isSystem: boolean = false
  ): Promise<IPermission> {
    // Verificar si ya existe el permiso
    const existingPermission = await Permission.findOne({ resource, action });
    if (existingPermission) {
      throw new Error(`El permiso ${resource}:${action} ya existe`);
    }

    const permission = new Permission({
      resource,
      action,
      description,
      isSystem,
    });

    return await permission.save();
  }

  /**
   * Actualiza un permiso
   */
  static async update(id: string, description: string): Promise<IPermission | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('ID de permiso inválido');
    }

    const permission = await Permission.findById(id);
    if (!permission) {
      throw new Error('Permiso no encontrado');
    }

    // No permitir actualizar permisos del sistema
    if (permission.isSystem) {
      throw new Error('No se pueden modificar permisos del sistema');
    }

    permission.description = description;
    return await permission.save();
  }

  /**
   * Elimina un permiso
   */
  static async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('ID de permiso inválido');
    }

    const permission = await Permission.findById(id);
    if (!permission) {
      throw new Error('Permiso no encontrado');
    }

    // No permitir eliminar permisos del sistema
    if (permission.isSystem) {
      throw new Error('No se pueden eliminar permisos del sistema');
    }

    await Permission.findByIdAndDelete(id);
  }

  /**
   * Inicializa los permisos del sistema
   */
  static async initializeSystemPermissions(): Promise<void> {
    const systemPermissions = [
      // USERS
      { resource: PermissionResource.USERS, action: PermissionAction.CREATE, description: 'Crear usuarios' },
      { resource: PermissionResource.USERS, action: PermissionAction.READ, description: 'Ver usuarios' },
      { resource: PermissionResource.USERS, action: PermissionAction.UPDATE, description: 'Actualizar usuarios' },
      { resource: PermissionResource.USERS, action: PermissionAction.DELETE, description: 'Eliminar usuarios' },
      { resource: PermissionResource.USERS, action: PermissionAction.MANAGE, description: 'Gestión completa de usuarios' },

      // ROLES
      { resource: PermissionResource.ROLES, action: PermissionAction.CREATE, description: 'Crear roles' },
      { resource: PermissionResource.ROLES, action: PermissionAction.READ, description: 'Ver roles' },
      { resource: PermissionResource.ROLES, action: PermissionAction.UPDATE, description: 'Actualizar roles' },
      { resource: PermissionResource.ROLES, action: PermissionAction.DELETE, description: 'Eliminar roles' },
      { resource: PermissionResource.ROLES, action: PermissionAction.MANAGE, description: 'Gestión completa de roles' },

      // VISITS
      { resource: PermissionResource.VISITS, action: PermissionAction.CREATE, description: 'Crear visitas' },
      { resource: PermissionResource.VISITS, action: PermissionAction.READ, description: 'Ver visitas' },
      { resource: PermissionResource.VISITS, action: PermissionAction.UPDATE, description: 'Actualizar visitas' },
      { resource: PermissionResource.VISITS, action: PermissionAction.DELETE, description: 'Eliminar visitas' },
      { resource: PermissionResource.VISITS, action: PermissionAction.MANAGE, description: 'Gestión completa de visitas' },

      // AUTHORIZATIONS
      { resource: PermissionResource.AUTHORIZATIONS, action: PermissionAction.CREATE, description: 'Crear autorizaciones' },
      { resource: PermissionResource.AUTHORIZATIONS, action: PermissionAction.READ, description: 'Ver autorizaciones' },
      { resource: PermissionResource.AUTHORIZATIONS, action: PermissionAction.UPDATE, description: 'Actualizar autorizaciones' },
      { resource: PermissionResource.AUTHORIZATIONS, action: PermissionAction.DELETE, description: 'Eliminar autorizaciones' },

      // REPORTS
      { resource: PermissionResource.REPORTS, action: PermissionAction.READ, description: 'Ver reportes' },
      { resource: PermissionResource.REPORTS, action: PermissionAction.EXECUTE, description: 'Generar reportes' },

      // SETTINGS
      { resource: PermissionResource.SETTINGS, action: PermissionAction.READ, description: 'Ver configuración' },
      { resource: PermissionResource.SETTINGS, action: PermissionAction.UPDATE, description: 'Modificar configuración' },
      { resource: PermissionResource.SETTINGS, action: PermissionAction.MANAGE, description: 'Gestión completa de configuración' },

      // DASHBOARD
      { resource: PermissionResource.DASHBOARD, action: PermissionAction.READ, description: 'Ver dashboard' },
    ];

    for (const perm of systemPermissions) {
      try {
        await this.create(perm.resource, perm.action, perm.description, true);
      } catch (error) {
        // Si el permiso ya existe, continuar
        continue;
      }
    }
  }
}
