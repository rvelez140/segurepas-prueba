import { Subscription } from '../models/Subscription';
import { ISubscription, ISubscriptionInput, PlanType } from '../interfaces/ISubscription';
import { Types } from 'mongoose';

export class SubscriptionService {
  // Configuración de planes predeterminados
  private static readonly PLAN_CONFIGS = {
    [PlanType.BASIC]: {
      amount: 29,
      maxUnits: 50,
      advancedReports: false,
      multipleEntries: false,
      apiAccess: false,
      whiteLabel: false,
    },
    [PlanType.PRO]: {
      amount: 69,
      maxUnits: 200,
      advancedReports: true,
      multipleEntries: false,
      apiAccess: false,
      whiteLabel: false,
    },
    [PlanType.ENTERPRISE]: {
      amount: 0, // Personalizado
      maxUnits: 999999, // Ilimitado
      advancedReports: true,
      multipleEntries: true,
      apiAccess: true,
      whiteLabel: true,
    },
  };

  static async createSubscription(data: ISubscriptionInput): Promise<ISubscription> {
    const config = this.PLAN_CONFIGS[data.planType];

    const subscriptionData = {
      residentialName: data.residentialName,
      planType: data.planType,
      pricing: {
        amount: data.pricing?.amount || config.amount,
        currency: data.pricing?.currency || 'USD',
        billingCycle: data.pricing?.billingCycle || 'monthly',
      },
      limits: {
        maxUnits: config.maxUnits,
        advancedReports: config.advancedReports,
        multipleEntries: config.multipleEntries,
        apiAccess: config.apiAccess,
        whiteLabel: config.whiteLabel,
      },
      status: 'trial',
      currentUsage: {
        unitsCount: 0,
      },
      // Trial de 30 días
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    const subscription = new Subscription(subscriptionData);
    return await subscription.save();
  }

  static async findById(id: string | Types.ObjectId): Promise<ISubscription | null> {
    return await Subscription.findById(id).exec();
  }

  static async getAllSubscriptions(): Promise<ISubscription[]> {
    return await Subscription.find().sort({ createdAt: -1 }).exec();
  }

  static async getActiveSubscriptions(): Promise<ISubscription[]> {
    return await Subscription.find({
      status: { $in: ['active', 'trial'] },
    }).exec();
  }

  static async updateSubscription(
    id: string | Types.ObjectId,
    updateData: Partial<ISubscription>
  ): Promise<ISubscription | null> {
    return await Subscription.findByIdAndUpdate(
      id,
      { $set: { ...updateData, updatedAt: new Date() } },
      { new: true }
    ).exec();
  }

  static async upgradePlan(
    id: string | Types.ObjectId,
    newPlan: PlanType,
    customAmount?: number
  ): Promise<ISubscription | null> {
    const config = this.PLAN_CONFIGS[newPlan];

    const updateData = {
      planType: newPlan,
      'pricing.amount': customAmount || config.amount,
      limits: {
        maxUnits: config.maxUnits,
        advancedReports: config.advancedReports,
        multipleEntries: config.multipleEntries,
        apiAccess: config.apiAccess,
        whiteLabel: config.whiteLabel,
      },
      updatedAt: new Date(),
    };

    return await Subscription.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }

  static async activateSubscription(id: string | Types.ObjectId): Promise<ISubscription | null> {
    const subscription = await Subscription.findById(id).exec();
    if (!subscription) throw new Error('Suscripción no encontrada');

    const nextPaymentDate = new Date();
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

    return await Subscription.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'active',
          startDate: new Date(),
          'paymentInfo.lastPaymentDate': new Date(),
          'paymentInfo.nextPaymentDate': nextPaymentDate,
          'paymentInfo.paymentStatus': 'completed',
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).exec();
  }

  static async cancelSubscription(id: string | Types.ObjectId): Promise<ISubscription | null> {
    return await Subscription.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'cancelled',
          endDate: new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).exec();
  }

  static async suspendSubscription(id: string | Types.ObjectId): Promise<ISubscription | null> {
    return await Subscription.findByIdAndUpdate(
      id,
      {
        $set: {
          status: 'suspended',
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).exec();
  }

  static async updateUsageCount(
    id: string | Types.ObjectId,
    unitsCount: number
  ): Promise<ISubscription | null> {
    return await Subscription.findByIdAndUpdate(
      id,
      {
        $set: {
          'currentUsage.unitsCount': unitsCount,
          updatedAt: new Date(),
        },
      },
      { new: true }
    ).exec();
  }

  static async checkLimits(id: string | Types.ObjectId): Promise<{
    isValid: boolean;
    isOverLimit: boolean;
    currentUnits: number;
    maxUnits: number;
  }> {
    const subscription = await Subscription.findById(id).exec();
    if (!subscription) {
      throw new Error('Suscripción no encontrada');
    }

    const isActive = subscription.isActive();
    const isOverLimit = subscription.isOverLimit();

    return {
      isValid: isActive && !isOverLimit,
      isOverLimit,
      currentUnits: subscription.currentUsage.unitsCount,
      maxUnits: subscription.limits.maxUnits,
    };
  }

  static async deleteSubscription(id: string | Types.ObjectId): Promise<ISubscription | null> {
    return await Subscription.findByIdAndDelete(id).exec();
  }

  static getPlanDetails(planType: PlanType): {
    name: string;
    description: string;
    features: string[];
    pricing: { amount: number; currency: string };
  } {
    const config = this.PLAN_CONFIGS[planType];

    const plans = {
      [PlanType.BASIC]: {
        name: 'Plan Básico',
        description: 'Ideal para residenciales pequeños',
        features: [
          `Hasta ${config.maxUnits} viviendas`,
          'Gestión de visitas',
          'Control de entrada/salida',
          'Códigos QR',
          'Reportes básicos',
        ],
        pricing: { amount: config.amount, currency: 'USD' },
      },
      [PlanType.PRO]: {
        name: 'Plan Pro',
        description: 'Para residenciales medianos con necesidades avanzadas',
        features: [
          `Hasta ${config.maxUnits} viviendas`,
          'Gestión de visitas',
          'Control de entrada/salida',
          'Códigos QR',
          'Reportes avanzados',
          'Analíticas y estadísticas',
          'Notificaciones personalizadas',
        ],
        pricing: { amount: config.amount, currency: 'USD' },
      },
      [PlanType.ENTERPRISE]: {
        name: 'Plan Enterprise',
        description: 'Solución personalizada para grandes residenciales',
        features: [
          'Viviendas ilimitadas',
          'Todas las características Pro',
          'Múltiples entradas',
          'Acceso API REST',
          'Marca blanca (White Label)',
          'Soporte prioritario',
          'Integración personalizada',
        ],
        pricing: { amount: config.amount, currency: 'USD' },
      },
    };

    return plans[planType];
  }
}
