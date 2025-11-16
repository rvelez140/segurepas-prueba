import { Request, Response } from 'express';
import { RoleService } from '../services/RoleService';
import { PermissionService } from '../services/PermissionService';
import { ICreateRoleDTO, IUpdateRoleDTO } from '../interfaces/IRole';

/**
 * Obtiene todos los roles
 */
export const getAllRoles = async (req: Request, res: Response): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const roles = await RoleService.findAll(includeInactive);
    res.json(roles);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al obtener roles' });
  }
};

/**
 * Obtiene un rol por ID
 */
export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const role = await RoleService.findById(id);

    if (!role) {
      res.status(404).json({ error: 'Rol no encontrado' });
      return;
    }

    res.json(role);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al obtener rol' });
  }
};

/**
 * Crea un nuevo rol
 */
export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const roleData: ICreateRoleDTO = req.body;

    if (!roleData.name || !roleData.description) {
      res.status(400).json({ error: 'Nombre y descripción son requeridos' });
      return;
    }

    const role = await RoleService.create(roleData);
    res.status(201).json(role);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al crear rol' });
  }
};

/**
 * Actualiza un rol
 */
export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: IUpdateRoleDTO = req.body;

    const role = await RoleService.update(id, updateData);

    if (!role) {
      res.status(404).json({ error: 'Rol no encontrado' });
      return;
    }

    res.json(role);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al actualizar rol' });
  }
};

/**
 * Elimina un rol
 */
export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await RoleService.delete(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Error al eliminar rol' });
  }
};

/**
 * Obtiene todos los permisos disponibles
 */
export const getAllPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const permissions = await PermissionService.findAll();
    res.json(permissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al obtener permisos' });
  }
};

/**
 * Inicializa los roles y permisos del sistema
 */
export const initializeSystem = async (req: Request, res: Response): Promise<void> => {
  try {
    await PermissionService.initializeSystemPermissions();
    await RoleService.initializeSystemRoles();
    res.json({ message: 'Sistema de roles y permisos inicializado correctamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error al inicializar sistema' });
  }
};
