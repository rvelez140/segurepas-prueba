import axios from "axios";
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra as {apiUrl: string};
const API_URL = apiUrl;

export interface PaymentIntent {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

export interface Payment {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'canceled';
  type: 'subscription' | 'one_time' | 'refund';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentIntentData {
  userId: string;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: any;
}

export interface ProcessCardPaymentData {
  userId: string;
  paymentMethodId: string;
  amount: number;
  currency?: string;
  description?: string;
  metadata?: any;
}

// Crear Payment Intent
export const createPaymentIntent = async (data: CreatePaymentIntentData): Promise<PaymentIntent> => {
  try {
    const response = await axios.post<PaymentIntent>(`${API_URL}/payments/intent`, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al crear payment intent");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Procesar pago con tarjeta
export const processCardPayment = async (data: ProcessCardPaymentData): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/payments/card`, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al procesar el pago");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Confirmar Payment Intent
export const confirmPaymentIntent = async (paymentIntentId: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/payments/intent/${paymentIntentId}/confirm`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al confirmar el pago");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Cancelar Payment Intent
export const cancelPaymentIntent = async (paymentIntentId: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/payments/intent/${paymentIntentId}/cancel`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al cancelar el pago");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Obtener historial de pagos del usuario
export const getUserPayments = async (userId: string): Promise<Payment[]> => {
  try {
    const response = await axios.get<Payment[]>(`${API_URL}/payments/user/${userId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al obtener historial de pagos");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Obtener detalles de un pago
export const getPaymentDetails = async (paymentId: string): Promise<Payment> => {
  try {
    const response = await axios.get<Payment>(`${API_URL}/payments/${paymentId}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al obtener detalles del pago");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Solicitar reembolso
export const requestRefund = async (paymentId: string, amount?: number): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/payments/${paymentId}/refund`, { amount });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al solicitar reembolso");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};
