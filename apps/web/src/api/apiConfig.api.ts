import axios from 'axios';

const API_URL = process.env.REACT_APP_API;

export interface ApiConfigField {
  key: string;
  value: string;
  isSecret: boolean;
  label: string;
  description?: string;
  required: boolean;
}

export interface ApiConfig {
  id: string;
  provider: string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  isConfigured: boolean;
  fields: ApiConfigField[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderStatus {
  provider: string;
  displayName: string;
  isEnabled: boolean;
  isConfigured: boolean;
  isAvailable: boolean;
  source: 'database' | 'env' | 'none';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Obtener todas las configuraciones
export const getAllApiConfigs = async (): Promise<ApiConfig[]> => {
  try {
    const response = await axios.get<ApiResponse<ApiConfig[]>>(`${API_URL}/config/apis`);
    return response.data.data || [];
  } catch (error: any) {
    console.error('Error al obtener configuraciones de API', error);
    throw new Error(error.response?.data?.message || 'Error al obtener configuraciones');
  }
};

// Obtener estado de todos los proveedores
export const getProvidersStatus = async (): Promise<ProviderStatus[]> => {
  try {
    const response = await axios.get<ApiResponse<ProviderStatus[]>>(`${API_URL}/config/apis/status`);
    return response.data.data || [];
  } catch (error: any) {
    console.error('Error al obtener estado de proveedores', error);
    throw new Error(error.response?.data?.message || 'Error al obtener estado');
  }
};

// Obtener configuración de un proveedor
export const getApiConfig = async (provider: string): Promise<ApiConfig> => {
  try {
    const response = await axios.get<ApiResponse<ApiConfig>>(`${API_URL}/config/apis/${provider}`);
    if (!response.data.data) {
      throw new Error('Configuración no encontrada');
    }
    return response.data.data;
  } catch (error: any) {
    console.error('Error al obtener configuración', error);
    throw new Error(error.response?.data?.message || 'Error al obtener configuración');
  }
};

// Actualizar configuración de un proveedor
export const updateApiConfig = async (
  provider: string,
  fields: { key: string; value: string }[],
  isEnabled?: boolean
): Promise<ApiConfig> => {
  try {
    const response = await axios.put<ApiResponse<ApiConfig>>(`${API_URL}/config/apis/${provider}`, {
      fields,
      isEnabled,
    });
    if (!response.data.data) {
      throw new Error('Error al actualizar');
    }
    return response.data.data;
  } catch (error: any) {
    console.error('Error al actualizar configuración', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar configuración');
  }
};

// Habilitar/deshabilitar proveedor
export const toggleProvider = async (provider: string, isEnabled: boolean): Promise<ApiConfig> => {
  try {
    const response = await axios.patch<ApiResponse<ApiConfig>>(
      `${API_URL}/config/apis/${provider}/toggle`,
      { isEnabled }
    );
    if (!response.data.data) {
      throw new Error('Error al cambiar estado');
    }
    return response.data.data;
  } catch (error: any) {
    console.error('Error al cambiar estado del proveedor', error);
    throw new Error(error.response?.data?.message || 'Error al cambiar estado');
  }
};

// Probar conexión de un proveedor
export const testProviderConnection = async (
  provider: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post<{ success: boolean; message: string }>(
      `${API_URL}/config/apis/${provider}/test`
    );
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Error al probar conexión',
    };
  }
};

// Inicializar proveedores
export const initializeProviders = async (): Promise<void> => {
  try {
    await axios.post(`${API_URL}/config/apis/initialize`);
  } catch (error: any) {
    console.error('Error al inicializar proveedores', error);
    throw new Error(error.response?.data?.message || 'Error al inicializar');
  }
};
