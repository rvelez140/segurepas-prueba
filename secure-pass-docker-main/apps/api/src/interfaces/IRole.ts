import { Document, Types } from 'mongoose';
import { IPermission } from './IPermission';

/**
 * Interface para un rol del sistema
 */
export interface IRole extends Document {
  _id: Types.ObjectId;
  name: string; // Nombre del rol (ej: "Admin", "Técnico", "Residente")
  slug: string; // Identificador único del rol (ej: "admin", "tecnico")
  description: string; // Descripción del rol
  permissions: Types.ObjectId[] | IPermission[]; // Lista de permisos asociados al rol
  isSystem: boolean; // Indica si es un rol del sistema (no se puede eliminar/editar completamente)
  isActive: boolean; // Indica si el rol está activo
  color: string; // Color para identificar el rol en la UI (ej: "#FF5733")
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para crear un nuevo rol
 */
export interface ICreateRoleDTO {
  name: string;
  slug?: string; // Opcional, se genera automáticamente si no se proporciona
  description: string;
  permissions: string[]; // Array de IDs de permisos
  color?: string;
}

/**
 * Interface para actualizar un rol
 */
export interface IUpdateRoleDTO {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
  color?: string;
}
