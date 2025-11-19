import axios from "axios";
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra as {apiUrl: string};
const API_URL = apiUrl;

export interface CommonSpace {
  _id: string;
  name: string;
  description: string;
  capacity: number;
  pricePerHour: number;
  availableHours: string[];
  image?: string;
  amenities: string[];
  rules: string[];
}

export interface Booking {
  _id: string;
  userId: string;
  spaceId: string;
  spaceName: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'completed';
  totalAmount: number;
  attendees: number;
  notes?: string;
  createdAt: Date;
}

export interface CreateBookingData {
  spaceId: string;
  date: Date;
  startTime: string;
  endTime: string;
  attendees: number;
  notes?: string;
}

// Obtener todos los espacios comunes
export const getCommonSpaces = async (): Promise<CommonSpace[]> => {
  try {
    const response = await axios.get<CommonSpace[]>(`${API_URL}/common-spaces`);
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener espacios comunes:", error);
    if (error.response) {
      throw new Error(error.response.data.error || "Error al obtener espacios");
    }
    throw new Error("No se pudo conectar con el servidor");
  }
};

// Obtener disponibilidad de un espacio
export const getSpaceAvailability = async (
  spaceId: string,
  date: string
): Promise<{ available: boolean; bookedSlots: string[] }> => {
  try {
    const response = await axios.get(
      `${API_URL}/common-spaces/${spaceId}/availability?date=${date}`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener disponibilidad:", error);
    throw new Error("Error al verificar disponibilidad");
  }
};

// Crear reserva
export const createBooking = async (data: CreateBookingData): Promise<Booking> => {
  try {
    const response = await axios.post<Booking>(`${API_URL}/bookings`, data);
    return {
      ...response.data,
      date: new Date(response.data.date),
      createdAt: new Date(response.data.createdAt),
    };
  } catch (error: any) {
    console.error("Error al crear reserva:", error);
    if (error.response) {
      throw new Error(error.response.data.error || "Error al crear reserva");
    }
    throw new Error("No se pudo crear la reserva");
  }
};

// Obtener reservas del usuario
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const response = await axios.get<Booking[]>(`${API_URL}/bookings/user/${userId}`);
    return response.data.map(booking => ({
      ...booking,
      date: new Date(booking.date),
      createdAt: new Date(booking.createdAt),
    }));
  } catch (error: any) {
    console.error("Error al obtener reservas:", error);
    throw new Error("Error al obtener reservas");
  }
};

// Cancelar reserva
export const cancelBooking = async (bookingId: string): Promise<void> => {
  try {
    await axios.patch(`${API_URL}/bookings/${bookingId}/cancel`);
  } catch (error: any) {
    console.error("Error al cancelar reserva:", error);
    if (error.response) {
      throw new Error(error.response.data.error || "Error al cancelar reserva");
    }
    throw new Error("No se pudo cancelar la reserva");
  }
};
