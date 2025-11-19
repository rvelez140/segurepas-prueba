import axios from "axios";
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra as {apiUrl: string};
const API_URL = apiUrl;

export interface CommunityEvent {
  _id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  organizer: string;
  maxAttendees?: number;
  attendees: string[];
  image?: string;
  type: 'meeting' | 'social' | 'maintenance' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed' | 'canceled';
}

// Obtener eventos
export const getCommunityEvents = async (): Promise<CommunityEvent[]> => {
  try {
    const response = await axios.get<CommunityEvent[]>(`${API_URL}/events`);
    return response.data.map(event => ({
      ...event,
      date: new Date(event.date),
    }));
  } catch (error: any) {
    console.error("Error al obtener eventos:", error);
    throw new Error("Error al obtener eventos");
  }
};

// Registrarse en evento
export const rsvpEvent = async (eventId: string, userId: string): Promise<void> => {
  try {
    await axios.post(`${API_URL}/events/${eventId}/rsvp`, { userId });
  } catch (error: any) {
    console.error("Error al registrarse:", error);
    throw new Error("Error al registrarse en el evento");
  }
};

// Cancelar registro
export const cancelRsvp = async (eventId: string, userId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/events/${eventId}/rsvp/${userId}`);
  } catch (error: any) {
    throw new Error("Error al cancelar registro");
  }
};
