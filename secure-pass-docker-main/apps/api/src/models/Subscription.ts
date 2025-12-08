import mongoose, { Schema, Model } from 'mongoose';
import { ISubscription, PlanType } from '../interfaces/ISubscription';

const subscriptionSchema: Schema = new mongoose.Schema(
  {
    residentialName: {
      type: String,
      required: [true, 'El nombre del residencial es requerido'],
      trim: true,
    },
    planType: {
      type: String,
      enum: Object.values(PlanType),
      required: [true, 'El tipo de plan es requerido'],
      default: PlanType.BASIC,
    },
    pricing: {
      amount: {
        type: Number,
        required: [true, 'El monto es requerido'],
      },
      currency: {
        type: String,
        default: 'USD',
      },
      billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly',
      },
    },
    limits: {
      maxUnits: {
        type: Number,
        required: [true, 'El límite de viviendas es requerido'],
      },
      advancedReports: {
        type: Boolean,
        default: false,
      },
      multipleEntries: {
        type: Boolean,
        default: false,
      },
      apiAccess: {
        type: Boolean,
        default: false,
      },
      whiteLabel: {
        type: Boolean,
        default: false,
      },
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial', 'cancelled', 'suspended'],
      default: 'trial',
    },
    currentUsage: {
      unitsCount: {
        type: Number,
        default: 0,
      },
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    trialEndDate: {
      type: Date,
    },
    paymentInfo: {
      lastPaymentDate: {
        type: Date,
      },
      nextPaymentDate: {
        type: Date,
      },
      paymentMethod: {
        type: String,
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
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

// Middleware para actualizar la fecha de actualización
subscriptionSchema.pre<ISubscription>('save', async function (next) {
  this.updatedAt = new Date();
  next();
});

// Método para verificar si el plan está activo
subscriptionSchema.methods.isActive = function (): boolean {
  return this.status === 'active' || this.status === 'trial';
};

// Método para verificar si se excedió el límite de viviendas
subscriptionSchema.methods.isOverLimit = function (): boolean {
  return this.currentUsage.unitsCount > this.limits.maxUnits;
};

// Método para verificar si tiene acceso a una característica
subscriptionSchema.methods.hasFeature = function (feature: keyof ISubscription['limits']): boolean {
  return this.limits[feature] === true;
};

export const Subscription: Model<ISubscription> = mongoose.model<ISubscription>(
  'Subscription',
  subscriptionSchema
);
export default Subscription;
