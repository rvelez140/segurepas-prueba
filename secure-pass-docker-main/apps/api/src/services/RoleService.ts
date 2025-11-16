import Role from '../models/Role';
import Permission from '../models/Permission';
import { IRole, ICreateRoleDTO, IUpdateRoleDTO } from '../interfaces/IRole';
import { Types } from 'mongoose';
import { PermissionResource, PermissionAction } from '../interfaces/IPermission';

export class RoleService {
  /**
   * Obtiene todos los roles
   */
  static async findAll(includeInactive: boolean = false): Promise<IRole[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return await Role.find(filter)
      .populate('permissions')
      .sort({ isSystem: -1, name: 1 });
  }

  /**
   * Obtiene un rol por ID
   */
  static async findById(id: string): Promise<IRole | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('ID de rol inválido');
    }
    return await Role.findById(id).populate('permissions');
  }

  /**
   * Obtiene un rol por slug
   */
  static async findBySlug(slug: string): Promise<IRole | null> {
    return await Role.findOne({ slug }).populate('permissions');
  }

  /**
   * Crea un nuevo rol
   */
  static async create(data: ICreateRoleDTO): Promise<IRole> {
    // Generar slug si no se proporciona
    const slug = data.slug || this.generateSlug(data.name);

    // Verificar si ya existe un rol con ese slug
    const existingRole = await Role.findOne({ slug });
    if (existingRole) {
      throw new Error(`Ya existe un rol con el slug "${slug}"`);
    }

    // Validar que todos los permisos existan
    if (data.permissions && data.permissions.length > 0) {
      const validPermissions = await Permission.find({
        _id: { $in: data.permissions },
      });

      if (validPermissions.length !== data.permissions.length) {
        throw new Error('Uno o más permisos no son válidos');
      }
    }

    const role = new Role({
      name: data.name,
      slug,
      description: data.description,
      permissions: data.permissions || [],
      color: data.color || this.generateRandomColor(),
      isSystem: false,
      isActive: true,
    });

    return await role.save();
  }

  /**
   * Actualiza un rol
   */
  static async update(id: string, data: IUpdateRoleDTO): Promise<IRole | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('ID de rol inválido');
    }

    const role = await Role.findById(id);
    if (!role) {
      throw new Error('Rol no encontrado');
    }

    // No permitir editar el nombre y slug de roles del sistema
    if (role.isSystem && (data.name || data.permissions)) {
      // Solo permitir cambiar la descripción y estado de roles del sistema
      if (data.description) role.description = data.description;
      if (data.isActive !== undefined) role.isActive = data.isActive;
      return await role.save();
    }

    // Actualizar campos
    if (data.name) role.name = data.name;
    if (data.description) role.description = data.description;
    if (data.color) role.color = data.color;
    if (data.isActive !== undefined) role.isActive = data.isActive;

    // Actualizar permisos
    if (data.permissions) {
      const validPermissions = await Permission.find({
        _id: { $in: data.permissions },
      });

      if (validPermissions.length !== data.permissions.length) {
        throw new Error('Uno o más permisos no son válidos');
      }

      role.permissions = data.permissions.map((p) => new Types.ObjectId(p));
    }

    return await role.save();
  }

  /**
   * Elimina un rol
   */
  static async delete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('ID de rol inválido');
    }

    const role = await Role.findById(id);
    if (!role) {
      throw new Error('Rol no encontrado');
    }

    // No permitir eliminar roles del sistema
    if (role.isSystem) {
      throw new Error('No se pueden eliminar roles del sistema');
    }

    // TODO: Verificar que no haya usuarios asignados a este rol
    // Esto se implementará cuando actualicemos UserService

    await Role.findByIdAndDelete(id);
  }

  /**
   * Verifica si un rol tiene un permiso específico
   */
  static async hasPermission(
    roleId: string,
    resource: PermissionResource,
    action: PermissionAction
  ): Promise<boolean> {
    const role = await this.findById(roleId);
    if (!role) return false;

    return role.permissions.some((permission: any) => {
      return (
        permission.resource === resource &&
        (permission.action === action || permission.action === PermissionAction.MANAGE)
      );
    });
  }

  /**
   * Genera un slug a partir del nombre
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
  }

  /**
   * Genera un color aleatorio en formato hexadecimal
   */
  private static generateRandomColor(): string {
    const colors = [
      '#EF4444', // Red
      '#F59E0B', // Amber
      '#10B981', // Green
      '#3B82F6', // Blue
      '#8B5CF6', // Violet
      '#EC4899', // Pink
      '#6366F1', // Indigo
      '#14B8A6', // Teal
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * Inicializa los roles del sistema con sus permisos
   */
  static async initializeSystemRoles(): Promise<void> {
    // Obtener todos los permisos
    const allPermissions = await Permission.find();

    // Función auxiliar para obtener IDs de permisos
    const getPermissionIds = (resource: PermissionResource, actions: PermissionAction[]) => {
      return allPermissions
        .filter((p) => p.resource === resource && actions.includes(p.action))
        .map((p) => p._id.toString());
    };

    // ROL: ADMIN (Acceso completo a todo)
    const adminPermissions = allPermissions.map((p) => p._id.toString());

    try {
      const existingAdmin = await Role.findOne({ slug: 'admin' });
      if (!existingAdmin) {
        await Role.create({
          name: 'Administrador',
          slug: 'admin',
          description: 'Acceso completo al sistema. No puede ser editado ni eliminado.',
          permissions: adminPermissions,
          isSystem: true,
          isActive: true,
          color: '#DC2626',
        });
      }
    } catch (error) {
      console.error('Error creando rol Admin:', error);
    }

    // ROL: TÉCNICO (Acceso a usuarios, visitas y reportes, pero no a roles)
    const tecnicoPermissions = [
      ...getPermissionIds(PermissionResource.USERS, [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.UPDATE]),
      ...getPermissionIds(PermissionResource.VISITS, [PermissionAction.MANAGE]),
      ...getPermissionIds(PermissionResource.AUTHORIZATIONS, [PermissionAction.READ, PermissionAction.UPDATE]),
      ...getPermissionIds(PermissionResource.REPORTS, [PermissionAction.READ, PermissionAction.EXECUTE]),
      ...getPermissionIds(PermissionResource.DASHBOARD, [PermissionAction.READ]),
      ...getPermissionIds(PermissionResource.SETTINGS, [PermissionAction.READ]),
      ...getPermissionIds(PermissionResource.ROLES, [PermissionAction.READ]),
    ];

    try {
      const existingTecnico = await Role.findOne({ slug: 'tecnico' });
      if (!existingTecnico) {
        await Role.create({
          name: 'Técnico',
          slug: 'tecnico',
          description: 'Gestión de usuarios, visitas y reportes. Sin acceso a gestión de roles.',
          permissions: tecnicoPermissions,
          isSystem: true,
          isActive: true,
          color: '#2563EB',
        });
      }
    } catch (error) {
      console.error('Error creando rol Técnico:', error);
    }

    // ROL: RESIDENTE (Crear y gestionar sus propias visitas)
    const residentePermissions = [
      ...getPermissionIds(PermissionResource.AUTHORIZATIONS, [PermissionAction.CREATE, PermissionAction.READ, PermissionAction.UPDATE]),
      ...getPermissionIds(PermissionResource.VISITS, [PermissionAction.READ]),
      ...getPermissionIds(PermissionResource.DASHBOARD, [PermissionAction.READ]),
      ...getPermissionIds(PermissionResource.SETTINGS, [PermissionAction.READ]),
    ];

    try {
      const existingResidente = await Role.findOne({ slug: 'residente' });
      if (!existingResidente) {
        await Role.create({
          name: 'Residente',
          slug: 'residente',
          description: 'Puede crear y gestionar sus propias autorizaciones de visitas.',
          permissions: residentePermissions,
          isSystem: true,
          isActive: true,
          color: '#059669',
        });
      }
    } catch (error) {
      console.error('Error creando rol Residente:', error);
    }

    // ROL: GUARDIA (Validar visitas, registrar entradas/salidas)
    const guardiaPermissions = [
      ...getPermissionIds(PermissionResource.VISITS, [PermissionAction.READ, PermissionAction.UPDATE]),
      ...getPermissionIds(PermissionResource.AUTHORIZATIONS, [PermissionAction.READ]),
      ...getPermissionIds(PermissionResource.USERS, [PermissionAction.READ]),
      ...getPermissionIds(PermissionResource.DASHBOARD, [PermissionAction.READ]),
    ];

    try {
      const existingGuardia = await Role.findOne({ slug: 'guardia' });
      if (!existingGuardia) {
        await Role.create({
          name: 'Guardia',
          slug: 'guardia',
          description: 'Valida visitas, registra entradas y salidas.',
          permissions: guardiaPermissions,
          isSystem: true,
          isActive: true,
          color: '#7C3AED',
        });
      }
    } catch (error) {
      console.error('Error creando rol Guardia:', error);
    }
  }
}
