import { Document, Types } from 'mongoose';
import { PaymentProvider } from './ISubscription';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELED = 'canceled',
}

export enum PaymentType {
  SUBSCRIPTION = 'subscription',
  ONE_TIME = 'one_time',
  REFUND = 'refund',
}

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  subscriptionId?: Types.ObjectId;
  provider: PaymentProvider;
  providerId: string; // ID de la transacción en Stripe/PayPal
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  description?: string;
  metadata?: Record<string, any>;
  paymentMethod?: string;
  receiptUrl?: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
