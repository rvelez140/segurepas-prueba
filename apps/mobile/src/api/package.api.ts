import axios from "axios";
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra as {apiUrl: string};
const API_URL = apiUrl;

export interface Package {
  _id: string;
  residentId: string;
  residentName: string;
  apartment: string;
  courier: string;
  trackingNumber?: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  receivedBy: string;
  receivedDate: Date;
  pickedUpBy?: string;
  pickedUpDate?: Date;
  signature?: string;
  photo?: string;
  status: 'pending' | 'picked_up';
  notes?: string;
}

export interface RegisterPackageData {
  residentId: string;
  courier: string;
  trackingNumber?: string;
  description: string;
  size: 'small' | 'medium' | 'large';
  photo?: string;
  notes?: string;
}

// Registrar paquete
export const registerPackage = async (data: RegisterPackageData): Promise<Package> => {
  try {
    const response = await axios.post<Package>(`${API_URL}/packages`, data);
    return {
      ...response.data,
      receivedDate: new Date(response.data.receivedDate),
      pickedUpDate: response.data.pickedUpDate
        ? new Date(response.data.pickedUpDate)
        : undefined,
    };
  } catch (error: any) {
    console.error("Error al registrar paquete:", error);
    throw new Error("Error al registrar paquete");
  }
};

// Obtener paquetes del residente
export const getResidentPackages = async (residentId: string): Promise<Package[]> => {
  try {
    const response = await axios.get<Package[]>(
      `${API_URL}/packages/resident/${residentId}`
    );
    return response.data.map(pkg => ({
      ...pkg,
      receivedDate: new Date(pkg.receivedDate),
      pickedUpDate: pkg.pickedUpDate ? new Date(pkg.pickedUpDate) : undefined,
    }));
  } catch (error: any) {
    console.error("Error al obtener paquetes:", error);
    throw new Error("Error al obtener paquetes");
  }
};

// Marcar paquete como recogido
export const pickupPackage = async (
  packageId: string,
  signature: string
): Promise<Package> => {
  try {
    const response = await axios.patch<Package>(
      `${API_URL}/packages/${packageId}/pickup`,
      { signature }
    );
    return {
      ...response.data,
      receivedDate: new Date(response.data.receivedDate),
      pickedUpDate: response.data.pickedUpDate
        ? new Date(response.data.pickedUpDate)
        : undefined,
    };
  } catch (error: any) {
    console.error("Error al marcar paquete como recogido:", error);
    throw new Error("Error al recoger paquete");
  }
};

// Obtener todos los paquetes pendientes
export const getPendingPackages = async (): Promise<Package[]> => {
  try {
    const response = await axios.get<Package[]>(`${API_URL}/packages/pending`);
    return response.data.map(pkg => ({
      ...pkg,
      receivedDate: new Date(pkg.receivedDate),
    }));
  } catch (error: any) {
    console.error("Error al obtener paquetes pendientes:", error);
    throw new Error("Error al obtener paquetes");
  }
};
