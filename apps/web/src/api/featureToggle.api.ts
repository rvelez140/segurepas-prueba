import axios from "axios";

const API_URL = process.env.REACT_APP_API;

export interface FeatureToggle {
  _id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  enabledForRoles?: string[];
  enabledForUsers?: string[];
  category?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Obtener todas las features
export const getAllFeatures = async (): Promise<FeatureToggle[]> => {
  try {
    const response = await axios.get(`${API_URL}/features`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo features:", error);
    throw error;
  }
};

// Obtener features por categoría
export const getFeaturesByCategory = async (category: string): Promise<FeatureToggle[]> => {
  try {
    const response = await axios.get(`${API_URL}/features/category/${category}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo features de categoría ${category}:`, error);
    throw error;
  }
};

// Obtener una feature específica
export const getFeatureByKey = async (key: string): Promise<FeatureToggle> => {
  try {
    const response = await axios.get(`${API_URL}/features/${key}`);
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo feature ${key}:`, error);
    throw error;
  }
};

// Crear una nueva feature
export const createFeature = async (data: {
  key: string;
  name: string;
  description: string;
  enabled?: boolean;
  enabledForRoles?: string[];
  enabledForUsers?: string[];
  category?: string;
  metadata?: Record<string, any>;
}): Promise<FeatureToggle> => {
  try {
    const response = await axios.post(`${API_URL}/features`, data);
    return response.data;
  } catch (error) {
    console.error("Error creando feature:", error);
    throw error;
  }
};

// Actualizar una feature
export const updateFeature = async (
  key: string,
  updates: Partial<FeatureToggle>
): Promise<FeatureToggle> => {
  try {
    const response = await axios.put(`${API_URL}/features/${key}`, updates);
    return response.data;
  } catch (error) {
    console.error(`Error actualizando feature ${key}:`, error);
    throw error;
  }
};

// Eliminar una feature
export const deleteFeature = async (key: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/features/${key}`);
  } catch (error) {
    console.error(`Error eliminando feature ${key}:`, error);
    throw error;
  }
};

// Toggle (activar/desactivar) una feature
export const toggleFeature = async (key: string): Promise<FeatureToggle> => {
  try {
    const response = await axios.post(`${API_URL}/features/${key}/toggle`);
    return response.data;
  } catch (error) {
    console.error(`Error toggleando feature ${key}:`, error);
    throw error;
  }
};

// Verificar si una feature está habilitada para el usuario actual
export const checkFeature = async (key: string): Promise<{ enabled: boolean }> => {
  try {
    const response = await axios.get(`${API_URL}/features/check/${key}`);
    return response.data;
  } catch (error) {
    console.error(`Error verificando feature ${key}:`, error);
    throw error;
  }
};

// Obtener features habilitadas para el usuario actual
export const getMyEnabledFeatures = async (): Promise<{ features: string[] }> => {
  try {
    const response = await axios.get(`${API_URL}/features/my-features`);
    return response.data;
  } catch (error) {
    console.error("Error obteniendo mis features habilitadas:", error);
    throw error;
  }
};

// Habilitar feature para un rol
export const enableForRole = async (key: string, role: string): Promise<FeatureToggle> => {
  try {
    const response = await axios.post(`${API_URL}/features/${key}/enable-role`, { role });
    return response.data;
  } catch (error) {
    console.error(`Error habilitando feature ${key} para rol ${role}:`, error);
    throw error;
  }
};

// Deshabilitar feature para un rol
export const disableForRole = async (key: string, role: string): Promise<FeatureToggle> => {
  try {
    const response = await axios.post(`${API_URL}/features/${key}/disable-role`, { role });
    return response.data;
  } catch (error) {
    console.error(`Error deshabilitando feature ${key} para rol ${role}:`, error);
    throw error;
  }
};

// Inicializar features por defecto
export const initializeDefaultFeatures = async (): Promise<{ message: string }> => {
  try {
    const response = await axios.post(`${API_URL}/features/initialize`);
    return response.data;
  } catch (error) {
    console.error("Error inicializando features por defecto:", error);
    throw error;
  }
};
