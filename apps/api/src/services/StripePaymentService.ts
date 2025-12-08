import Stripe from 'stripe';
import { env } from '../config/env';
import { Payment } from '../models/Payment';
import { Subscription } from '../models/Subscription';
import { PaymentProvider, SubscriptionPlan, SubscriptionStatus } from '../interfaces/ISubscription';
import { PaymentStatus, PaymentType } from '../interfaces/IPayment';
import { Types } from 'mongoose';

class StripePaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-02-24.acacia',
    });
  }

  /**
   * Crea una sesión de checkout de Stripe
   */
  async createCheckoutSession(
    userId: string,
    plan: SubscriptionPlan,
    billingCycle: 'monthly' | 'yearly',
    successUrl: string,
    cancelUrl: string
  ): Promise<Stripe.Checkout.Session> {
    const priceId = this.getPriceId(plan, billingCycle);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      metadata: {
        userId,
        plan,
        billingCycle,
      },
    });

    return session;
  }

  /**
   * Crea una suscripción después del pago exitoso
   */
  async createSubscription(
    userId: string,
    stripeSubscriptionId: string
  ): Promise<any> {
    const stripeSubscription = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);

    const subscription = new Subscription({
      userId: new Types.ObjectId(userId),
      plan: stripeSubscription.metadata.plan || SubscriptionPlan.BASIC,
      status: this.mapStripeStatus(stripeSubscription.status),
      provider: PaymentProvider.STRIPE,
      providerId: stripeSubscription.id,
      startDate: new Date(stripeSubscription.current_period_start * 1000),
      endDate: new Date(stripeSubscription.current_period_end * 1000),
      amount: stripeSubscription.items.data[0].price.unit_amount || 0,
      currency: stripeSubscription.currency.toUpperCase(),
      billingCycle: stripeSubscription.metadata.billingCycle || 'monthly',
      autoRenew: !stripeSubscription.cancel_at_period_end,
      metadata: {
        customerId: stripeSubscription.customer,
        priceId: stripeSubscription.items.data[0].price.id,
      },
    });

    await subscription.save();

    // Crear registro de pago
    await this.createPaymentRecord(
      userId,
      subscription.id,
      stripeSubscription.latest_invoice as string
    );

    return subscription;
  }

  /**
   * Crea un registro de pago
   */
  async createPaymentRecord(
    userId: string,
    subscriptionId: string,
    invoiceId: string
  ): Promise<any> {
    const invoice = await this.stripe.invoices.retrieve(invoiceId);

    const payment = new Payment({
      userId: new Types.ObjectId(userId),
      subscriptionId: new Types.ObjectId(subscriptionId),
      provider: PaymentProvider.STRIPE,
      providerId: invoice.payment_intent as string,
      amount: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      status: invoice.paid ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
      type: PaymentType.SUBSCRIPTION,
      description: invoice.description || 'Pago de suscripción',
      paymentMethod: invoice.payment_intent ? 'card' : undefined,
      receiptUrl: invoice.hosted_invoice_url || undefined,
      metadata: {
        invoiceId: invoice.id,
      },
    });

    await payment.save();
    return payment;
  }

  /**
   * Cancela una suscripción
   */
  async cancelSubscription(subscriptionId: string): Promise<any> {
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Suscripción no encontrada');
    }

    await this.stripe.subscriptions.cancel(subscription.providerId);

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = new Date();
    subscription.autoRenew = false;
    await subscription.save();

    return subscription;
  }

  /**
   * Procesa webhook de Stripe
   */
  async handleWebhook(payload: string | Buffer, signature: string): Promise<any> {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET || ''
    );

    switch (event.type) {
      case 'checkout.session.completed':
        return await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);

      case 'customer.subscription.updated':
        return await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);

      case 'customer.subscription.deleted':
        return await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);

      case 'invoice.payment_succeeded':
        return await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);

      case 'invoice.payment_failed':
        return await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.client_reference_id || session.metadata?.userId;
    if (!userId) return;

    const subscriptionId = session.subscription as string;
    if (subscriptionId) {
      await this.createSubscription(userId, subscriptionId);
    }
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await Subscription.findOne({ providerId: stripeSubscription.id });
    if (!subscription) return;

    subscription.status = this.mapStripeStatus(stripeSubscription.status);
    subscription.endDate = new Date(stripeSubscription.current_period_end * 1000);
    subscription.autoRenew = !stripeSubscription.cancel_at_period_end;
    await subscription.save();
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const subscription = await Subscription.findOne({ providerId: stripeSubscription.id });
    if (!subscription) return;

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = new Date();
    await subscription.save();
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const subscription = await Subscription.findOne({
      providerId: invoice.subscription as string
    });
    if (!subscription) return;

    await this.createPaymentRecord(
      subscription.userId.toString(),
      subscription.id,
      invoice.id
    );
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscription = await Subscription.findOne({
      providerId: invoice.subscription as string
    });
    if (!subscription) return;

    const payment = new Payment({
      userId: subscription.userId,
      subscriptionId: subscription._id,
      provider: PaymentProvider.STRIPE,
      providerId: invoice.payment_intent as string || invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency.toUpperCase(),
      status: PaymentStatus.FAILED,
      type: PaymentType.SUBSCRIPTION,
      description: 'Pago fallido de suscripción',
      failureReason: 'Payment failed',
      metadata: {
        invoiceId: invoice.id,
      },
    });

    await payment.save();
  }

  private mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      canceled: SubscriptionStatus.CANCELED,
      incomplete: SubscriptionStatus.PENDING,
      incomplete_expired: SubscriptionStatus.EXPIRED,
      past_due: SubscriptionStatus.ACTIVE,
      trialing: SubscriptionStatus.TRIAL,
      unpaid: SubscriptionStatus.PENDING,
      paused: SubscriptionStatus.CANCELED,
    };

    return statusMap[status] || SubscriptionStatus.PENDING;
  }

  private getPriceId(plan: SubscriptionPlan, billingCycle: 'monthly' | 'yearly'): string {
    // Estos son IDs de ejemplo. En producción, debes usar los IDs reales de tus productos en Stripe
    const priceIds: Record<SubscriptionPlan, Record<string, string>> = {
      [SubscriptionPlan.BASIC]: {
        monthly: env.STRIPE_PRICE_BASIC_MONTHLY || 'price_basic_monthly',
        yearly: env.STRIPE_PRICE_BASIC_YEARLY || 'price_basic_yearly',
      },
      [SubscriptionPlan.PREMIUM]: {
        monthly: env.STRIPE_PRICE_PREMIUM_MONTHLY || 'price_premium_monthly',
        yearly: env.STRIPE_PRICE_PREMIUM_YEARLY || 'price_premium_yearly',
      },
      [SubscriptionPlan.ENTERPRISE]: {
        monthly: env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
        yearly: env.STRIPE_PRICE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
      },
    };

    return priceIds[plan][billingCycle];
  }
}

export const stripePaymentService = new StripePaymentService();
