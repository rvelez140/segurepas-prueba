import { Document, Types } from "mongoose";

export enum PlanType {
  BASIC = "basico",
  PRO = "pro",
  ENTERPRISE = "enterprise",
}

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  residentialName: string; // Nombre del residencial
  planType: PlanType; // Tipo de plan
  pricing: {
    amount: number; // Precio en USD
    currency: string; // Moneda (USD)
    billingCycle: "monthly" | "yearly"; // Ciclo de facturación
  };
  limits: {
    maxUnits: number; // Límite de viviendas
    advancedReports: boolean; // Acceso a reportes avanzados
    multipleEntries: boolean; // Múltiples entradas
    apiAccess: boolean; // Acceso a API
    whiteLabel: boolean; // Marca blanca
  };
  status:
    | "active"
    | "inactive"
    | "trial"
    | "cancelled"
    | "suspended"; // Estado de la suscripción
  currentUsage: {
    unitsCount: number; // Cantidad actual de viviendas
  };
  startDate: Date; // Fecha de inicio
  endDate?: Date; // Fecha de fin (opcional)
  trialEndDate?: Date; // Fecha de fin de trial (opcional)
  paymentInfo?: {
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
    paymentMethod?: string;
    paymentStatus?: "pending" | "completed" | "failed" | "refunded";
  };
  createdAt: Date;
  updatedAt: Date;

  // Métodos
  isActive(): boolean;
  isOverLimit(): boolean;
  hasFeature(feature: keyof ISubscription["limits"]): boolean;
}

export interface ISubscriptionInput {
  residentialName: string;
  planType: PlanType;
  pricing?: {
    amount: number;
    currency?: string;
    billingCycle?: "monthly" | "yearly";
  };
}
