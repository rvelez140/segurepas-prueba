import axios from 'axios';

const API_URL = process.env.REACT_APP_API;

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  useDocker: boolean;
}

export interface ApiFieldConfig {
  key: string;
  value: string;
}

export interface ApiConfigInput {
  provider: string;
  fields: ApiFieldConfig[];
  isEnabled: boolean;
}

export interface SetupStatus {
  status: string;
  databaseConfigured: boolean;
  apisConfigured: boolean;
  adminCreated: boolean;
  temporaryAdminActive: boolean;
  installedAt: string | null;
  completedAt: string | null;
  needsSetup?: boolean;
}

export interface SetupCheckResponse {
  needsWizard: boolean;
  needsAdminCreation: boolean;
  error?: string;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
}

export interface InstallMongoDBResult {
  success: boolean;
  message: string;
  containerId?: string;
}

export interface CompleteSetupResult {
  success: boolean;
  message: string;
  temporaryCredentials?: {
    email: string;
    password: string;
  };
}

export interface AvailableApi {
  provider: string;
  displayName: string;
  description: string;
  isEnabled: boolean;
  isConfigured: boolean;
  fields: {
    key: string;
    label: string;
    description?: string;
    required: boolean;
    isSecret: boolean;
    hasValue: boolean;
  }[];
}

export interface CreateAdminData {
  email: string;
  password: string;
  name: string;
  username?: string;
}

/**
 * Obtiene el estado actual del setup
 */
export const getSetupStatus = async (): Promise<SetupStatus> => {
  try {
    const response = await axios.get<SetupStatus>(`${API_URL}/setup/status`);
    return response.data;
  } catch (error: any) {
    return {
      status: 'pending',
      databaseConfigured: false,
      apisConfigured: false,
      adminCreated: false,
      temporaryAdminActive: false,
      installedAt: null,
      completedAt: null,
      needsSetup: true,
    };
  }
};

/**
 * Verifica si necesita mostrar el wizard de configuración
 */
export const checkSetupNeeded = async (): Promise<SetupCheckResponse> => {
  try {
    const response = await axios.get<SetupCheckResponse>(`${API_URL}/setup/needs-wizard`);
    return response.data;
  } catch (error: any) {
    return {
      needsWizard: true,
      needsAdminCreation: false,
      error: 'No se pudo conectar al servidor',
    };
  }
};

/**
 * Prueba la conexión a la base de datos
 */
export const testDatabaseConnection = async (config: DatabaseConfig): Promise<TestConnectionResult> => {
  try {
    const response = await axios.post<TestConnectionResult>(`${API_URL}/setup/test-database`, config);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Error al conectar con el servidor',
    };
  }
};

/**
 * Instala MongoDB usando Docker
 */
export const installMongoDB = async (config: Partial<DatabaseConfig>): Promise<InstallMongoDBResult> => {
  try {
    const response = await axios.post<InstallMongoDBResult>(`${API_URL}/setup/install-mongodb`, config);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Error al instalar MongoDB',
    };
  }
};

/**
 * Completa la configuración inicial
 */
export const completeSetup = async (
  database: DatabaseConfig,
  apis?: ApiConfigInput[]
): Promise<CompleteSetupResult> => {
  try {
    const response = await axios.post<CompleteSetupResult>(`${API_URL}/setup/complete`, {
      database,
      apis,
    });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Error al completar la configuración',
    };
  }
};

/**
 * Obtiene los proveedores de API disponibles
 */
export const getAvailableApis = async (): Promise<AvailableApi[]> => {
  try {
    const response = await axios.get<AvailableApi[]>(`${API_URL}/setup/apis`);
    return response.data;
  } catch (error: any) {
    return [];
  }
};

/**
 * Crea el usuario administrador permanente
 */
export const createPermanentAdmin = async (data: CreateAdminData): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post<{ success: boolean; message: string }>(`${API_URL}/setup/create-admin`, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Error al crear el administrador',
    };
  }
};

/**
 * Verifica si el admin temporal está activo
 */
export const isTemporaryAdminActive = async (): Promise<boolean> => {
  try {
    const response = await axios.get<{ isActive: boolean }>(`${API_URL}/setup/temporary-admin-active`);
    return response.data.isActive;
  } catch (error: any) {
    return false;
  }
};
