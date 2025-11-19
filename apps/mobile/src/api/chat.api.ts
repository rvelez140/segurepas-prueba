import axios from "axios";
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra as {apiUrl: string};
const API_URL = apiUrl;

export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderRole: 'residente' | 'guardia' | 'admin';
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'system';
  imageUrl?: string;
}

export interface Chat {
  _id: string;
  participants: {
    userId: string;
    name: string;
    role: string;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageData {
  chatId: string;
  message: string;
  type?: 'text' | 'image';
  imageUrl?: string;
}

// Obtener chats del usuario
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    const response = await axios.get<Chat[]>(`${API_URL}/chats/user/${userId}`);
    return response.data.map(chat => ({
      ...chat,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      lastMessage: chat.lastMessage
        ? { ...chat.lastMessage, timestamp: new Date(chat.lastMessage.timestamp) }
        : undefined,
    }));
  } catch (error: any) {
    console.error("Error al obtener chats:", error);
    throw new Error("Error al cargar chats");
  }
};

// Obtener mensajes de un chat
export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const response = await axios.get<Message[]>(`${API_URL}/chats/${chatId}/messages`);
    return response.data.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  } catch (error: any) {
    console.error("Error al obtener mensajes:", error);
    throw new Error("Error al cargar mensajes");
  }
};

// Enviar mensaje
export const sendMessage = async (data: SendMessageData): Promise<Message> => {
  try {
    const response = await axios.post<Message>(`${API_URL}/chats/messages`, data);
    return {
      ...response.data,
      timestamp: new Date(response.data.timestamp),
    };
  } catch (error: any) {
    console.error("Error al enviar mensaje:", error);
    throw new Error("Error al enviar mensaje");
  }
};

// Crear o obtener chat con un usuario
export const getOrCreateChat = async (
  userId: string,
  otherUserId: string
): Promise<Chat> => {
  try {
    const response = await axios.post<Chat>(`${API_URL}/chats/create`, {
      userId,
      otherUserId,
    });
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  } catch (error: any) {
    console.error("Error al crear chat:", error);
    throw new Error("Error al crear chat");
  }
};

// Marcar mensajes como leídos
export const markMessagesAsRead = async (chatId: string): Promise<void> => {
  try {
    await axios.patch(`${API_URL}/chats/${chatId}/read`);
  } catch (error: any) {
    console.error("Error al marcar como leído:", error);
  }
};
