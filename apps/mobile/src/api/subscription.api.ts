import axios from "axios";
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra as {apiUrl: string};
const API_URL = apiUrl;

export interface Subscription {
  _id: string;
  userId: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'canceled' | 'expired' | 'pending' | 'trial';
  provider: 'stripe' | 'paypal';
  providerId: string;
  startDate: Date;
  endDate: Date;
  canceledAt?: Date;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStripeCheckoutData {
  userId: string;
  plan: 'basic' | 'premium' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
}

export interface CreatePayPalSubscriptionData {
  userId: string;
  plan: 'basic' | 'premium' | 'enterprise';
  billingCycle: 'monthly' | 'yearly';
}

export interface StripeCheckoutResponse {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

export interface PayPalSubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  approvalUrl?: string;
  error?: string;
}

// Crear sesión de checkout de Stripe
export const createStripeCheckout = async (data: CreateStripeCheckoutData): Promise<StripeCheckoutResponse> => {
  try {
    const response = await axios.post<StripeCheckoutResponse>(`${API_URL}/subscriptions/stripe/checkout`, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al crear checkout de Stripe");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Crear suscripción de PayPal
export const createPayPalSubscription = async (data: CreatePayPalSubscriptionData): Promise<PayPalSubscriptionResponse> => {
  try {
    const response = await axios.post<PayPalSubscriptionResponse>(`${API_URL}/subscriptions/paypal/create`, data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al crear suscripción de PayPal");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Activar suscripción de PayPal
export const activatePayPalSubscription = async (userId: string, subscriptionId: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/subscriptions/paypal/activate`, { userId, subscriptionId });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al activar suscripción de PayPal");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Obtener suscripciones del usuario
export const getUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  try {
    const response = await axios.get<Subscription[]>(`${API_URL}/subscriptions/user/${userId}`);
    return response.data.map(sub => ({
      ...sub,
      startDate: new Date(sub.startDate),
      endDate: new Date(sub.endDate),
      canceledAt: sub.canceledAt ? new Date(sub.canceledAt) : undefined,
      createdAt: new Date(sub.createdAt),
      updatedAt: new Date(sub.updatedAt)
    }));
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al obtener suscripciones");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Obtener suscripción activa del usuario
export const getActiveSubscription = async (userId: string): Promise<Subscription | null> => {
  try {
    const response = await axios.get<Subscription>(`${API_URL}/subscriptions/user/${userId}/active`);
    if (!response.data) return null;

    return {
      ...response.data,
      startDate: new Date(response.data.startDate),
      endDate: new Date(response.data.endDate),
      canceledAt: response.data.canceledAt ? new Date(response.data.canceledAt) : undefined,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt)
    };
  } catch (error: any) {
    if (error.response) {
      if (error.response.status === 404) {
        return null;
      }
      throw new Error(error.response.data.error || "Error al obtener suscripción activa");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Cancelar suscripción
export const cancelSubscription = async (subscriptionId: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_URL}/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al cancelar suscripción");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};
