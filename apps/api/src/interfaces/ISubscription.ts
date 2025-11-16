import { Document, Types } from 'mongoose';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  PENDING = 'pending',
  TRIAL = 'trial'
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export enum PaymentProvider {
  STRIPE = 'stripe',
  PAYPAL = 'paypal'
}

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  provider: PaymentProvider;
  providerId: string; // ID de la suscripción en Stripe/PayPal
  startDate: Date;
  endDate: Date;
  canceledAt?: Date;
  trialEndDate?: Date;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  autoRenew: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
