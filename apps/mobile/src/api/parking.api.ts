import axios from "axios";
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra as {apiUrl: string};
const API_URL = apiUrl;

export interface Vehicle {
  _id: string;
  residentId: string;
  licensePlate: string;
  brand: string;
  model: string;
  color: string;
  type: 'car' | 'motorcycle' | 'truck';
  parkingSpot?: string;
  isActive: boolean;
}

export interface ParkingEntry {
  _id: string;
  vehicleId: string;
  licensePlate: string;
  entryTime: Date;
  exitTime?: Date;
  guardId: string;
  parkingSpot: string;
  photo?: string;
}

// Registrar vehículo
export const registerVehicle = async (data: Omit<Vehicle, '_id'>): Promise<Vehicle> => {
  try {
    const response = await axios.post<Vehicle>(`${API_URL}/vehicles`, data);
    return response.data;
  } catch (error: any) {
    console.error("Error al registrar vehículo:", error);
    throw new Error("Error al registrar vehículo");
  }
};

// Obtener vehículos del residente
export const getResidentVehicles = async (residentId: string): Promise<Vehicle[]> => {
  try {
    const response = await axios.get<Vehicle[]>(`${API_URL}/vehicles/resident/${residentId}`);
    return response.data;
  } catch (error: any) {
    throw new Error("Error al obtener vehículos");
  }
};

// Registrar entrada de vehículo
export const registerParkingEntry = async (data: {
  licensePlate: string;
  parkingSpot: string;
  photo?: string;
}): Promise<ParkingEntry> => {
  try {
    const response = await axios.post<ParkingEntry>(`${API_URL}/parking/entry`, data);
    return {
      ...response.data,
      entryTime: new Date(response.data.entryTime),
    };
  } catch (error: any) {
    throw new Error("Error al registrar entrada");
  }
};
