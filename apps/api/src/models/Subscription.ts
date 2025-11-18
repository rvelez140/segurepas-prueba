import mongoose, { Schema, Model } from 'mongoose';
import { ISubscription, SubscriptionStatus, SubscriptionPlan, PaymentProvider } from '../interfaces/ISubscription';

const subscriptionSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El ID de usuario es requerido'],
      index: true,
    },
    plan: {
      type: String,
      enum: Object.values(SubscriptionPlan),
      required: [true, 'El plan es requerido'],
    },
    status: {
      type: String,
      enum: Object.values(SubscriptionStatus),
      default: SubscriptionStatus.PENDING,
      index: true,
    },
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      required: [true, 'El proveedor de pago es requerido'],
    },
    providerId: {
      type: String,
      required: [true, 'El ID del proveedor es requerido'],
      unique: true,
    },
    startDate: {
      type: Date,
      required: [true, 'La fecha de inicio es requerida'],
    },
    endDate: {
      type: Date,
      required: [true, 'La fecha de fin es requerida'],
    },
    canceledAt: {
      type: Date,
    },
    trialEndDate: {
      type: Date,
    },
    amount: {
      type: Number,
      required: [true, 'El monto es requerido'],
      min: [0, 'El monto debe ser mayor o igual a 0'],
    },
    currency: {
      type: String,
      required: [true, 'La moneda es requerida'],
      default: 'USD',
      uppercase: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: [true, 'El ciclo de facturación es requerido'],
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Índice compuesto para optimizar consultas
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

export const Subscription: Model<ISubscription> = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
export default Subscription;
