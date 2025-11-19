import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export interface Plan {
  name: string;
  description: string;
  features: string[];
  pricing: {
    amount: number;
    currency: string;
  };
}

export interface Subscription {
  id: string;
  residentialName: string;
  planType: string;
  pricing: {
    amount: number;
    currency: string;
    billingCycle: string;
  };
  limits: {
    maxUnits: number;
    advancedReports: boolean;
    multipleEntries: boolean;
    apiAccess: boolean;
    whiteLabel: boolean;
  };
  status: string;
  currentUsage: {
    unitsCount: number;
  };
  startDate: string;
  endDate?: string;
  trialEndDate?: string;
  paymentInfo?: {
    lastPaymentDate?: string;
    nextPaymentDate?: string;
    paymentMethod?: string;
    paymentStatus?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Obtener todos los planes disponibles
export const getAllPlans = async (): Promise<Plan[]> => {
  const response = await axios.get(`${API_URL}/plans`);
  return response.data;
};

// Obtener detalles de un plan específico
export const getPlanDetails = async (planType: string): Promise<Plan> => {
  const response = await axios.get(`${API_URL}/plans/${planType}`);
  return response.data;
};

// Crear una nueva suscripción
export const createSubscription = async (data: {
  residentialName: string;
  planType: string;
  pricing?: {
    amount?: number;
    currency?: string;
    billingCycle?: string;
  };
}): Promise<Subscription> => {
  const response = await axios.post(`${API_URL}/`, data);
  return response.data;
};

// Obtener todas las suscripciones
export const getAllSubscriptions = async (): Promise<Subscription[]> => {
  const response = await axios.get(`${API_URL}/`);
  return response.data;
};

// Obtener suscripciones activas
export const getActiveSubscriptions = async (): Promise<Subscription[]> => {
  const response = await axios.get(`${API_URL}/active`);
  return response.data;
};

// Obtener una suscripción por ID
export const getSubscription = async (id: string): Promise<Subscription> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Actualizar suscripción
export const updateSubscription = async (
  id: string,
  data: Partial<Subscription>
): Promise<Subscription> => {
  const response = await axios.put(`${API_URL}/${id}`, data);
  return response.data;
};

// Actualizar plan
export const upgradePlan = async (
  id: string,
  planType: string,
  customAmount?: number
): Promise<Subscription> => {
  const response = await axios.post(`${API_URL}/${id}/upgrade`, {
    planType,
    customAmount,
  });
  return response.data;
};

// Activar suscripción
export const activateSubscription = async (
  id: string
): Promise<Subscription> => {
  const response = await axios.post(`${API_URL}/${id}/activate`);
  return response.data;
};

// Cancelar suscripción
export const cancelSubscription = async (id: string): Promise<Subscription> => {
  const response = await axios.post(`${API_URL}/${id}/cancel`);
  return response.data;
};

// Suspender suscripción
export const suspendSubscription = async (
  id: string
): Promise<Subscription> => {
  const response = await axios.post(`${API_URL}/${id}/suspend`);
  return response.data;
};

// Actualizar uso
export const updateUsage = async (
  id: string,
  unitsCount: number
): Promise<Subscription> => {
  const response = await axios.put(`${API_URL}/${id}/usage`, { unitsCount });
  return response.data;
};

// Verificar límites
export const checkLimits = async (
  id: string
): Promise<{
  isValid: boolean;
  isOverLimit: boolean;
  currentUnits: number;
  maxUnits: number;
}> => {
  const response = await axios.get(`${API_URL}/${id}/limits`);
  return response.data;
};

// Eliminar suscripción
export const deleteSubscription = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
