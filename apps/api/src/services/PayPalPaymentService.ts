import { env } from '../config/env';
import { Payment } from '../models/Payment';
import { Subscription } from '../models/Subscription';
import { PaymentProvider, SubscriptionPlan, SubscriptionStatus } from '../interfaces/ISubscription';
import { PaymentStatus, PaymentType } from '../interfaces/IPayment';
import { Types } from 'mongoose';

// PayPal SDK types
interface PayPalSubscription {
  id: string;
  status: string;
  status_update_time: string;
  plan_id: string;
  start_time: string;
  quantity: string;
  shipping_amount?: {
    currency_code: string;
    value: string;
  };
  subscriber?: {
    email_address: string;
    payer_id: string;
  };
  billing_info?: {
    outstanding_balance?: {
      currency_code: string;
      value: string;
    };
    cycle_executions?: Array<{
      tenure_type: string;
      sequence: number;
      cycles_completed: number;
      cycles_remaining: number;
      current_pricing_scheme_version: number;
      total_cycles: number;
    }>;
    last_payment?: {
      amount: {
        currency_code: string;
        value: string;
      };
      time: string;
    };
    next_billing_time?: string;
  };
}

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: any;
  create_time: string;
}

class PayPalPaymentService {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.baseUrl = env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
    this.clientId = env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = env.PAYPAL_CLIENT_SECRET || '';
  }

  /**
   * Obtiene el token de acceso de PayPal
   */
  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Crea una suscripción en PayPal
   */
  async createSubscription(
    userId: string,
    plan: SubscriptionPlan,
    billingCycle: 'monthly' | 'yearly',
    returnUrl: string,
    cancelUrl: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();
    const planId = this.getPlanId(plan, billingCycle);

    const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: 'SecurePass',
          locale: 'es-ES',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
          },
          return_url: returnUrl,
          cancel_url: cancelUrl,
        },
        custom_id: userId,
      }),
    });

    const data = await response.json();

    // Encontrar el link de aprobación
    const approvalLink = data.links?.find((link: any) => link.rel === 'approve');

    return {
      subscriptionId: data.id,
      approvalUrl: approvalLink?.href,
    };
  }

  /**
   * Activa una suscripción después de la aprobación del usuario
   */
  async activateSubscription(
    userId: string,
    paypalSubscriptionId: string
  ): Promise<any> {
    const accessToken = await this.getAccessToken();

    // Obtener detalles de la suscripción
    const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions/${paypalSubscriptionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const paypalSubscription: PayPalSubscription = await response.json();

    // Calcular fecha de fin basado en el ciclo
    const startDate = new Date(paypalSubscription.start_time);
    const endDate = new Date(startDate);
    const planId = paypalSubscription.plan_id;

    // Determinar si es mensual o anual basado en el plan ID
    if (planId.includes('yearly') || planId.includes('annual')) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    const subscription = new Subscription({
      userId: new Types.ObjectId(userId),
      plan: this.extractPlanFromId(planId),
      status: this.mapPayPalStatus(paypalSubscription.status),
      provider: PaymentProvider.PAYPAL,
      providerId: paypalSubscription.id,
      startDate: startDate,
      endDate: endDate,
      amount: parseFloat(paypalSubscription.billing_info?.last_payment?.amount.value || '0') * 100,
      currency: paypalSubscription.billing_info?.last_payment?.amount.currency_code || 'USD',
      billingCycle: planId.includes('yearly') || planId.includes('annual') ? 'yearly' : 'monthly',
      autoRenew: true,
      metadata: {
        planId: paypalSubscription.plan_id,
        payerId: paypalSubscription.subscriber?.payer_id,
      },
    });

    await subscription.save();

    // Crear registro de pago si existe
    if (paypalSubscription.billing_info?.last_payment) {
      await this.createPaymentRecord(
        userId,
        subscription.id,
        paypalSubscription
      );
    }

    return subscription;
  }

  /**
   * Crea un registro de pago
   */
  async createPaymentRecord(
    userId: string,
    subscriptionId: string,
    paypalSubscription: PayPalSubscription
  ): Promise<any> {
    const lastPayment = paypalSubscription.billing_info?.last_payment;
    if (!lastPayment) return null;

    const payment = new Payment({
      userId: new Types.ObjectId(userId),
      subscriptionId: new Types.ObjectId(subscriptionId),
      provider: PaymentProvider.PAYPAL,
      providerId: paypalSubscription.id,
      amount: parseFloat(lastPayment.amount.value) * 100,
      currency: lastPayment.amount.currency_code,
      status: PaymentStatus.COMPLETED,
      type: PaymentType.SUBSCRIPTION,
      description: 'Pago de suscripción vía PayPal',
      paymentMethod: 'paypal',
      metadata: {
        paypalSubscriptionId: paypalSubscription.id,
        payerId: paypalSubscription.subscriber?.payer_id,
      },
    });

    await payment.save();
    return payment;
  }

  /**
   * Cancela una suscripción
   */
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<any> {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Suscripción no encontrada');
    }

    const accessToken = await this.getAccessToken();

    await fetch(`${this.baseUrl}/v1/billing/subscriptions/${subscription.providerId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        reason: reason || 'Usuario solicitó cancelación',
      }),
    });

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = new Date();
    subscription.autoRenew = false;
    await subscription.save();

    return subscription;
  }

  /**
   * Procesa webhook de PayPal
   */
  async handleWebhook(webhookEvent: PayPalWebhookEvent): Promise<any> {
    switch (webhookEvent.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        return await this.handleSubscriptionActivated(webhookEvent.resource);

      case 'BILLING.SUBSCRIPTION.UPDATED':
        return await this.handleSubscriptionUpdated(webhookEvent.resource);

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        return await this.handleSubscriptionCancelled(webhookEvent.resource);

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        return await this.handleSubscriptionSuspended(webhookEvent.resource);

      case 'BILLING.SUBSCRIPTION.EXPIRED':
        return await this.handleSubscriptionExpired(webhookEvent.resource);

      case 'PAYMENT.SALE.COMPLETED':
        return await this.handlePaymentCompleted(webhookEvent.resource);

      default:
        console.log(`Evento PayPal no manejado: ${webhookEvent.event_type}`);
    }
  }

  private async handleSubscriptionActivated(resource: any): Promise<void> {
    const userId = resource.custom_id;
    if (!userId) return;

    await this.activateSubscription(userId, resource.id);
  }

  private async handleSubscriptionUpdated(resource: any): Promise<void> {
    const subscription = await Subscription.findOne({ providerId: resource.id });
    if (!subscription) return;

    subscription.status = this.mapPayPalStatus(resource.status);
    await subscription.save();
  }

  private async handleSubscriptionCancelled(resource: any): Promise<void> {
    const subscription = await Subscription.findOne({ providerId: resource.id });
    if (!subscription) return;

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = new Date();
    subscription.autoRenew = false;
    await subscription.save();
  }

  private async handleSubscriptionSuspended(resource: any): Promise<void> {
    const subscription = await Subscription.findOne({ providerId: resource.id });
    if (!subscription) return;

    subscription.status = SubscriptionStatus.CANCELED;
    await subscription.save();
  }

  private async handleSubscriptionExpired(resource: any): Promise<void> {
    const subscription = await Subscription.findOne({ providerId: resource.id });
    if (!subscription) return;

    subscription.status = SubscriptionStatus.EXPIRED;
    await subscription.save();
  }

  private async handlePaymentCompleted(resource: any): Promise<void> {
    // Este evento se dispara cuando se completa un pago de suscripción
    const subscriptionId = resource.billing_agreement_id;
    if (!subscriptionId) return;

    const subscription = await Subscription.findOne({ providerId: subscriptionId });
    if (!subscription) return;

    const payment = new Payment({
      userId: subscription.userId,
      subscriptionId: subscription._id,
      provider: PaymentProvider.PAYPAL,
      providerId: resource.id,
      amount: parseFloat(resource.amount.total) * 100,
      currency: resource.amount.currency,
      status: PaymentStatus.COMPLETED,
      type: PaymentType.SUBSCRIPTION,
      description: 'Pago de suscripción vía PayPal',
      paymentMethod: 'paypal',
      receiptUrl: resource.links?.find((link: any) => link.rel === 'self')?.href,
    });

    await payment.save();
  }

  private mapPayPalStatus(status: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      'ACTIVE': SubscriptionStatus.ACTIVE,
      'APPROVAL_PENDING': SubscriptionStatus.PENDING,
      'APPROVED': SubscriptionStatus.PENDING,
      'SUSPENDED': SubscriptionStatus.CANCELED,
      'CANCELLED': SubscriptionStatus.CANCELED,
      'EXPIRED': SubscriptionStatus.EXPIRED,
    };

    return statusMap[status] || SubscriptionStatus.PENDING;
  }

  private extractPlanFromId(planId: string): SubscriptionPlan {
    if (planId.includes('basic')) return SubscriptionPlan.BASIC;
    if (planId.includes('premium')) return SubscriptionPlan.PREMIUM;
    if (planId.includes('enterprise')) return SubscriptionPlan.ENTERPRISE;
    return SubscriptionPlan.BASIC;
  }

  private getPlanId(plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly'): string {
    // Estos son IDs de ejemplo. En producción, debes usar los IDs reales de tus planes en PayPal
    const planIds: Record<SubscriptionPlan, Record<string, string>> = {
      [SubscriptionPlan.BASIC]: {
        monthly: env.PAYPAL_PLAN_BASIC_MONTHLY || 'P-basic-monthly',
        yearly: env.PAYPAL_PLAN_BASIC_YEARLY || 'P-basic-yearly',
      },
      [SubscriptionPlan.PREMIUM]: {
        monthly: env.PAYPAL_PLAN_PREMIUM_MONTHLY || 'P-premium-monthly',
        yearly: env.PAYPAL_PLAN_PREMIUM_YEARLY || 'P-premium-yearly',
      },
      [SubscriptionPlan.ENTERPRISE]: {
        monthly: env.PAYPAL_PLAN_ENTERPRISE_MONTHLY || 'P-enterprise-monthly',
        yearly: env.PAYPAL_PLAN_ENTERPRISE_YEARLY || 'P-enterprise-yearly',
      },
    };

    return planIds[plan][billingCycle];
  }
}

export const paypalPaymentService = new PayPalPaymentService();
