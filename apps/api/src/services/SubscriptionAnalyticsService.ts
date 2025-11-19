import { Subscription } from '../models/Subscription';
import { Payment } from '../models/Payment';
import { SubscriptionStatus, SubscriptionPlan, PaymentProvider } from '../interfaces/ISubscription';
import { PaymentStatus } from '../interfaces/IPayment';

export interface AnalyticsPeriod {
  startDate: Date;
  endDate: Date;
}

export interface RevenueMetrics {
  totalRevenue: number;
  totalSubscriptions: number;
  averageRevenuePerUser: number;
  revenueByPlan: Record<SubscriptionPlan, number>;
  revenueByProvider: Record<PaymentProvider, number>;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
}

export interface SubscriptionMetrics {
  totalActive: number;
  totalCanceled: number;
  totalExpired: number;
  totalPending: number;
  totalTrial: number;
  byPlan: Record<SubscriptionPlan, number>;
  byProvider: Record<PaymentProvider, number>;
  churnRate: number;
  retentionRate: number;
}

export interface GrowthMetrics {
  newSubscriptions: number;
  canceledSubscriptions: number;
  netGrowth: number;
  growthRate: number;
}

export interface PaymentMetrics {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  averageTransactionValue: number;
}

class SubscriptionAnalyticsService {
  /**
   * Obtiene métricas de ingresos para un período específico
   */
  async getRevenueMetrics(period: AnalyticsPeriod): Promise<RevenueMetrics> {
    const payments = await Payment.find({
      status: PaymentStatus.COMPLETED,
      createdAt: {
        $gte: period.startDate,
        $lte: period.endDate,
      },
    }).populate('subscriptionId');

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalSubscriptions = new Set(payments.map(p => p.subscriptionId?.toString())).size;

    // Revenue por plan
    const revenueByPlan = await this.calculateRevenueByPlan(period);

    // Revenue por proveedor
    const revenueByProvider = await this.calculateRevenueByProvider(period);

    // MRR y ARR
    const { mrr, arr } = await this.calculateRecurringRevenue();

    return {
      totalRevenue,
      totalSubscriptions,
      averageRevenuePerUser: totalSubscriptions > 0 ? totalRevenue / totalSubscriptions : 0,
      revenueByPlan,
      revenueByProvider,
      monthlyRecurringRevenue: mrr,
      annualRecurringRevenue: arr,
    };
  }

  /**
   * Obtiene métricas de suscripciones
   */
  async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
    const allSubscriptions = await Subscription.find({});

    const totalActive = allSubscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length;
    const totalCanceled = allSubscriptions.filter(s => s.status === SubscriptionStatus.CANCELED).length;
    const totalExpired = allSubscriptions.filter(s => s.status === SubscriptionStatus.EXPIRED).length;
    const totalPending = allSubscriptions.filter(s => s.status === SubscriptionStatus.PENDING).length;
    const totalTrial = allSubscriptions.filter(s => s.status === SubscriptionStatus.TRIAL).length;

    // Por plan
    const byPlan = await this.calculateSubscriptionsByPlan();

    // Por proveedor
    const byProvider = await this.calculateSubscriptionsByProvider();

    // Churn y retención
    const { churnRate, retentionRate } = await this.calculateChurnAndRetention();

    return {
      totalActive,
      totalCanceled,
      totalExpired,
      totalPending,
      totalTrial,
      byPlan,
      byProvider,
      churnRate,
      retentionRate,
    };
  }

  /**
   * Obtiene métricas de crecimiento para un período
   */
  async getGrowthMetrics(period: AnalyticsPeriod): Promise<GrowthMetrics> {
    const newSubscriptions = await Subscription.countDocuments({
      createdAt: {
        $gte: period.startDate,
        $lte: period.endDate,
      },
    });

    const canceledSubscriptions = await Subscription.countDocuments({
      canceledAt: {
        $gte: period.startDate,
        $lte: period.endDate,
      },
    });

    const netGrowth = newSubscriptions - canceledSubscriptions;

    // Calcular tasa de crecimiento
    const previousPeriodStart = new Date(period.startDate);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);

    const previousPeriodSubscriptions = await Subscription.countDocuments({
      createdAt: { $lte: period.startDate },
      $or: [
        { canceledAt: { $exists: false } },
        { canceledAt: { $gt: period.startDate } },
      ],
    });

    const growthRate = previousPeriodSubscriptions > 0
      ? (netGrowth / previousPeriodSubscriptions) * 100
      : 0;

    return {
      newSubscriptions,
      canceledSubscriptions,
      netGrowth,
      growthRate,
    };
  }

  /**
   * Obtiene métricas de pagos para un período
   */
  async getPaymentMetrics(period: AnalyticsPeriod): Promise<PaymentMetrics> {
    const payments = await Payment.find({
      createdAt: {
        $gte: period.startDate,
        $lte: period.endDate,
      },
    });

    const totalPayments = payments.length;
    const successfulPayments = payments.filter(p => p.status === PaymentStatus.COMPLETED).length;
    const failedPayments = payments.filter(p => p.status === PaymentStatus.FAILED).length;

    const totalAmount = payments
      .filter(p => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      successRate: totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
      averageTransactionValue: successfulPayments > 0 ? totalAmount / successfulPayments : 0,
    };
  }

  /**
   * Obtiene dashboard completo de analytics
   */
  async getDashboard(period: AnalyticsPeriod) {
    const [revenue, subscriptions, growth, payments] = await Promise.all([
      this.getRevenueMetrics(period),
      this.getSubscriptionMetrics(),
      this.getGrowthMetrics(period),
      this.getPaymentMetrics(period),
    ]);

    return {
      period,
      revenue,
      subscriptions,
      growth,
      payments,
      generatedAt: new Date(),
    };
  }

  /**
   * Obtiene tendencias de suscripciones por mes
   */
  async getSubscriptionTrends(months: number = 12) {
    const trends = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const newSubs = await Subscription.countDocuments({
        createdAt: { $gte: periodStart, $lte: periodEnd },
      });

      const canceledSubs = await Subscription.countDocuments({
        canceledAt: { $gte: periodStart, $lte: periodEnd },
      });

      const revenue = await Payment.aggregate([
        {
          $match: {
            createdAt: { $gte: periodStart, $lte: periodEnd },
            status: PaymentStatus.COMPLETED,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      trends.push({
        month: periodStart.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        newSubscriptions: newSubs,
        canceledSubscriptions: canceledSubs,
        netGrowth: newSubs - canceledSubs,
        revenue: revenue[0]?.total || 0,
      });
    }

    return trends;
  }

  /**
   * Métodos privados auxiliares
   */

  private async calculateRevenueByPlan(period: AnalyticsPeriod): Promise<Record<SubscriptionPlan, number>> {
    const result = await Payment.aggregate([
      {
        $match: {
          status: PaymentStatus.COMPLETED,
          createdAt: { $gte: period.startDate, $lte: period.endDate },
        },
      },
      {
        $lookup: {
          from: 'subscriptions',
          localField: 'subscriptionId',
          foreignField: '_id',
          as: 'subscription',
        },
      },
      { $unwind: '$subscription' },
      {
        $group: {
          _id: '$subscription.plan',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const revenueByPlan: Record<SubscriptionPlan, number> = {
      [SubscriptionPlan.BASIC]: 0,
      [SubscriptionPlan.PREMIUM]: 0,
      [SubscriptionPlan.ENTERPRISE]: 0,
    };

    result.forEach(item => {
      if (item._id) {
        revenueByPlan[item._id as SubscriptionPlan] = item.total;
      }
    });

    return revenueByPlan;
  }

  private async calculateRevenueByProvider(period: AnalyticsPeriod): Promise<Record<PaymentProvider, number>> {
    const result = await Payment.aggregate([
      {
        $match: {
          status: PaymentStatus.COMPLETED,
          createdAt: { $gte: period.startDate, $lte: period.endDate },
        },
      },
      {
        $group: {
          _id: '$provider',
          total: { $sum: '$amount' },
        },
      },
    ]);

    const revenueByProvider: Record<PaymentProvider, number> = {
      [PaymentProvider.STRIPE]: 0,
      [PaymentProvider.PAYPAL]: 0,
    };

    result.forEach(item => {
      if (item._id) {
        revenueByProvider[item._id as PaymentProvider] = item.total;
      }
    });

    return revenueByProvider;
  }

  private async calculateRecurringRevenue(): Promise<{ mrr: number; arr: number }> {
    const activeSubscriptions = await Subscription.find({
      status: SubscriptionStatus.ACTIVE,
    });

    let mrr = 0;

    activeSubscriptions.forEach(sub => {
      if (sub.billingCycle === 'monthly') {
        mrr += sub.amount;
      } else if (sub.billingCycle === 'yearly') {
        mrr += sub.amount / 12;
      }
    });

    return {
      mrr,
      arr: mrr * 12,
    };
  }

  private async calculateSubscriptionsByPlan(): Promise<Record<SubscriptionPlan, number>> {
    const result = await Subscription.aggregate([
      {
        $match: {
          status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
        },
      },
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
        },
      },
    ]);

    const byPlan: Record<SubscriptionPlan, number> = {
      [SubscriptionPlan.BASIC]: 0,
      [SubscriptionPlan.PREMIUM]: 0,
      [SubscriptionPlan.ENTERPRISE]: 0,
    };

    result.forEach(item => {
      if (item._id) {
        byPlan[item._id as SubscriptionPlan] = item.count;
      }
    });

    return byPlan;
  }

  private async calculateSubscriptionsByProvider(): Promise<Record<PaymentProvider, number>> {
    const result = await Subscription.aggregate([
      {
        $match: {
          status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL] },
        },
      },
      {
        $group: {
          _id: '$provider',
          count: { $sum: 1 },
        },
      },
    ]);

    const byProvider: Record<PaymentProvider, number> = {
      [PaymentProvider.STRIPE]: 0,
      [PaymentProvider.PAYPAL]: 0,
    };

    result.forEach(item => {
      if (item._id) {
        byProvider[item._id as PaymentProvider] = item.count;
      }
    });

    return byProvider;
  }

  private async calculateChurnAndRetention(): Promise<{ churnRate: number; retentionRate: number }> {
    const now = new Date();
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const activeAtStart = await Subscription.countDocuments({
      createdAt: { $lte: lastMonthStart },
      $or: [
        { canceledAt: { $exists: false } },
        { canceledAt: { $gt: lastMonthStart } },
      ],
    });

    const canceledDuringPeriod = await Subscription.countDocuments({
      canceledAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    });

    const churnRate = activeAtStart > 0 ? (canceledDuringPeriod / activeAtStart) * 100 : 0;
    const retentionRate = 100 - churnRate;

    return { churnRate, retentionRate };
  }
}

export const subscriptionAnalyticsService = new SubscriptionAnalyticsService();
