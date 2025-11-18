import axios from "axios";
import Constants from 'expo-constants';

const { apiUrl } = Constants.expoConfig?.extra as {apiUrl: string};
const API_URL = apiUrl;

export interface RevenueMetrics {
  totalRevenue: number;
  revenueByPlan: {
    basic: number;
    premium: number;
    enterprise: number;
  };
  revenueByProvider: {
    stripe: number;
    paypal: number;
  };
  mrr: number;
  arr: number;
  averageRevenuePerUser: number;
}

export interface SubscriptionMetrics {
  totalActive: number;
  totalCanceled: number;
  totalExpired: number;
  totalPending: number;
  totalTrial: number;
  byPlan: {
    basic: number;
    premium: number;
    enterprise: number;
  };
  byProvider: {
    stripe: number;
    paypal: number;
  };
  churnRate: number;
  retentionRate: number;
}

export interface PaymentMetrics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  averageTransactionValue: number;
}

export interface GrowthMetrics {
  newSubscriptions: number;
  canceledSubscriptions: number;
  netGrowth: number;
  growthRate: number;
}

export interface MonthlyMetric {
  month: string;
  year: number;
  revenue: number;
  newSubscriptions: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  churnRate: number;
}

export interface DashboardData {
  revenueMetrics: RevenueMetrics;
  subscriptionMetrics: SubscriptionMetrics;
  paymentMetrics: PaymentMetrics;
  growthMetrics: GrowthMetrics;
  trends: MonthlyMetric[];
}

// Obtener dashboard completo
export const getDashboard = async (startDate?: string, endDate?: string): Promise<DashboardData> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get<DashboardData>(`${API_URL}/analytics/dashboard?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al obtener dashboard");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Obtener métricas de ingresos
export const getRevenueMetrics = async (startDate?: string, endDate?: string): Promise<RevenueMetrics> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get<RevenueMetrics>(`${API_URL}/analytics/revenue?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al obtener métricas de ingresos");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Obtener métricas de suscripciones
export const getSubscriptionMetrics = async (): Promise<SubscriptionMetrics> => {
  try {
    const response = await axios.get<SubscriptionMetrics>(`${API_URL}/analytics/subscriptions`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al obtener métricas de suscripciones");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Obtener métricas de pagos
export const getPaymentMetrics = async (): Promise<PaymentMetrics> => {
  try {
    const response = await axios.get<PaymentMetrics>(`${API_URL}/analytics/payments`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al obtener métricas de pagos");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Obtener métricas de crecimiento
export const getGrowthMetrics = async (startDate?: string, endDate?: string): Promise<GrowthMetrics> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await axios.get<GrowthMetrics>(`${API_URL}/analytics/growth?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al obtener métricas de crecimiento");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};

// Obtener tendencias mensuales
export const getTrends = async (): Promise<MonthlyMetric[]> => {
  try {
    const response = await axios.get<{ monthlyMetrics: MonthlyMetric[] }>(`${API_URL}/analytics/trends`);
    return response.data.monthlyMetrics;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || "Error al obtener tendencias");
    } else if (error.request) {
      throw new Error("No se recibió respuesta del servidor");
    } else {
      throw new Error("Error al configurar la solicitud");
    }
  }
};
