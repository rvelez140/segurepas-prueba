import axios from "axios";
import { Role, Permission, CreateRoleDTO, UpdateRoleDTO } from "../types/role.types";

const API_URL = process.env.REACT_APP_API;

/**
 * Obtiene todos los roles
 */
export const getAllRoles = async (includeInactive: boolean = false): Promise<Role[]> => {
  try {
    const response = await axios.get(`${API_URL}/roles`, {
      params: { includeInactive },
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo roles:", error);
    throw error;
  }
};

/**
 * Obtiene un rol por ID
 */
export const getRoleById = async (id: string): Promise<Role> => {
  try {
    const response = await axios.get(`${API_URL}/roles/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo rol ${id}:`, error);
    throw error;
  }
};

/**
 * Crea un nuevo rol
 */
export const createRole = async (roleData: CreateRoleDTO): Promise<Role> => {
  try {
    const response = await axios.post(`${API_URL}/roles`, roleData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error creando rol:", error);
    throw error;
  }
};

/**
 * Actualiza un rol
 */
export const updateRole = async (id: string, updateData: UpdateRoleDTO): Promise<Role> => {
  try {
    const response = await axios.put(`${API_URL}/roles/${id}`, updateData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error actualizando rol ${id}:`, error);
    throw error;
  }
};

/**
 * Elimina un rol
 */
export const deleteRole = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/roles/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  } catch (error) {
    console.error(`Error eliminando rol ${id}:`, error);
    throw error;
  }
};

/**
 * Obtiene todos los permisos disponibles
 */
export const getAllPermissions = async (): Promise<Permission[]> => {
  try {
    const response = await axios.get(`${API_URL}/permissions`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo permisos:", error);
    throw error;
  }
};

/**
 * Inicializa el sistema de roles y permisos
 */
export const initializeSystem = async (): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/initialize`, {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error inicializando sistema:", error);
    throw error;
  }
};

/**
 * Asigna un rol a un usuario
 */
export const assignRoleToUser = async (userId: string, roleId: string): Promise<any> => {
  try {
    const response = await axios.put(
      `${API_URL}/users/${userId}/assign-role`,
      { roleId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error asignando rol al usuario ${userId}:`, error);
    throw error;
  }
};

/**
 * Obtiene usuarios con sus roles poblados
 */
export const getUsersWithRoles = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/users-with-roles`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo usuarios con roles:", error);
    throw error;
  }
};
