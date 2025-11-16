import mongoose, { Schema, Model } from 'mongoose';
import { IPayment, PaymentStatus, PaymentType } from '../interfaces/IPayment';
import { PaymentProvider } from '../interfaces/ISubscription';

const paymentSchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El ID de usuario es requerido'],
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
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
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(PaymentType),
      required: [true, 'El tipo de pago es requerido'],
    },
    description: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    paymentMethod: {
      type: String,
    },
    receiptUrl: {
      type: String,
    },
    failureReason: {
      type: String,
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

// Índices para optimizar consultas
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ createdAt: -1 });

export const Payment: Model<IPayment> = mongoose.model<IPayment>('Payment', paymentSchema);
export default Payment;
