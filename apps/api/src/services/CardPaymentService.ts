import Stripe from 'stripe';
import { env } from '../config/env';
import { Payment } from '../models/Payment';
import { PaymentProvider } from '../interfaces/ISubscription';
import { PaymentStatus, PaymentType } from '../interfaces/IPayment';
import { Types } from 'mongoose';
import { notificationService } from './NotificationService';
import { UserService } from './UserService';

/**
 * Servicio para procesar pagos únicos con tarjeta
 */
class CardPaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-02-24.acacia',
    });
  }

  /**
   * Crea un Payment Intent para procesar un pago con tarjeta
   */
  async createPaymentIntent(
    userId: string,
    amount: number,
    currency: string = 'USD',
    description?: string,
    metadata?: Record<string, any>
  ): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amount, // en centavos
      currency: currency.toLowerCase(),
      description: description || 'Pago en SecurePass',
      metadata: {
        userId,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Procesa un pago con tarjeta usando un token de pago
   */
  async processCardPayment(
    userId: string,
    paymentMethodId: string,
    amount: number,
    currency: string = 'USD',
    description?: string,
    metadata?: Record<string, any>
  ): Promise<any> {
    try {
      // Crear el payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency: currency.toLowerCase(),
        payment_method: paymentMethodId,
        confirm: true,
        description: description || 'Pago en SecurePass',
        metadata: {
          userId,
          ...metadata,
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
      });

      // Crear registro de pago en la base de datos
      const payment = new Payment({
        userId: new Types.ObjectId(userId),
        provider: PaymentProvider.STRIPE,
        providerId: paymentIntent.id,
        amount: amount,
        currency: currency.toUpperCase(),
        status: this.mapStripePaymentStatus(paymentIntent.status),
        type: PaymentType.ONE_TIME,
        description: description || 'Pago único con tarjeta',
        paymentMethod: 'card',
        metadata: {
          paymentIntentId: paymentIntent.id,
          ...metadata,
        },
      });

      await payment.save();

      // Si el pago fue exitoso, enviar email de confirmación
      if (paymentIntent.status === 'succeeded') {
        const user = await UserService.findById(userId);
        if (user) {
          await notificationService.sendPaymentSuccess(user.auth.email, user.name, payment);
        }
      }

      return {
        payment,
        paymentIntent,
      };
    } catch (error: any) {
      // Crear registro de pago fallido
      const payment = new Payment({
        userId: new Types.ObjectId(userId),
        provider: PaymentProvider.STRIPE,
        providerId: error.payment_intent?.id || 'unknown',
        amount: amount,
        currency: currency.toUpperCase(),
        status: PaymentStatus.FAILED,
        type: PaymentType.ONE_TIME,
        description: description || 'Pago único con tarjeta',
        paymentMethod: 'card',
        failureReason: error.message,
        metadata: {
          errorCode: error.code,
          ...metadata,
        },
      });

      await payment.save();

      // Enviar email de pago fallido
      const user = await UserService.findById(userId);
      if (user) {
        await notificationService.sendPaymentFailed(user.auth.email, user.name, payment);
      }

      throw error;
    }
  }

  /**
   * Confirma un Payment Intent existente
   */
  async confirmPaymentIntent(paymentIntentId: string): Promise<any> {
    const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);

    // Actualizar el registro de pago en la base de datos
    const payment = await Payment.findOne({ providerId: paymentIntentId });
    if (payment) {
      payment.status = this.mapStripePaymentStatus(paymentIntent.status);
      await payment.save();

      // Si el pago fue exitoso, enviar email
      if (paymentIntent.status === 'succeeded') {
        const user = await UserService.findById(payment.userId.toString());
        if (user) {
          await notificationService.sendPaymentSuccess(user.auth.email, user.name, payment);
        }
      }
    }

    return paymentIntent;
  }

  /**
   * Obtiene el estado de un Payment Intent
   */
  async getPaymentIntentStatus(paymentIntentId: string): Promise<any> {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      created: new Date(paymentIntent.created * 1000),
    };
  }

  /**
   * Cancela un Payment Intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<any> {
    const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);

    // Actualizar el registro de pago
    const payment = await Payment.findOne({ providerId: paymentIntentId });
    if (payment) {
      payment.status = PaymentStatus.CANCELED;
      await payment.save();
    }

    return paymentIntent;
  }

  /**
   * Crea un Setup Intent para guardar tarjeta sin cargo
   */
  async createSetupIntent(userId: string): Promise<{
    clientSecret: string;
    setupIntentId: string;
  }> {
    const setupIntent = await this.stripe.setupIntents.create({
      metadata: {
        userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: setupIntent.client_secret!,
      setupIntentId: setupIntent.id,
    };
  }

  /**
   * Obtiene los métodos de pago guardados de un usuario
   */
  async getPaymentMethods(customerId: string): Promise<any[]> {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    return paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand,
      last4: pm.card?.last4,
      expMonth: pm.card?.exp_month,
      expYear: pm.card?.exp_year,
    }));
  }

  /**
   * Elimina un método de pago
   */
  async detachPaymentMethod(paymentMethodId: string): Promise<void> {
    await this.stripe.paymentMethods.detach(paymentMethodId);
  }

  /**
   * Procesa un reembolso
   */
  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<any> {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Pago no encontrado');
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: payment.providerId,
      amount: amount, // Si no se especifica, se reembolsa el monto completo
      reason: reason as any,
    });

    // Crear registro de reembolso
    const refundPayment = new Payment({
      userId: payment.userId,
      provider: PaymentProvider.STRIPE,
      providerId: refund.id,
      amount: refund.amount,
      currency: refund.currency.toUpperCase(),
      status: refund.status === 'succeeded' ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
      type: PaymentType.REFUND,
      description: `Reembolso de pago ${payment.providerId}`,
      paymentMethod: 'card',
      metadata: {
        originalPaymentId: payment.id,
        refundId: refund.id,
        reason,
      },
    });

    await refundPayment.save();

    // Actualizar el pago original
    payment.status = PaymentStatus.REFUNDED;
    await payment.save();

    return {
      refund,
      refundPayment,
    };
  }

  /**
   * Obtiene el historial de pagos de un usuario
   */
  async getUserPayments(userId: string, limit: number = 10, offset: number = 0): Promise<any> {
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const total = await Payment.countDocuments({ userId });

    return {
      payments,
      total,
      limit,
      offset,
    };
  }

  /**
   * Obtiene un pago específico por ID
   */
  async getPaymentById(paymentId: string): Promise<any> {
    return await Payment.findById(paymentId);
  }

  /**
   * Mapea el estado de Stripe a nuestro estado de pago
   */
  private mapStripePaymentStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      succeeded: PaymentStatus.COMPLETED,
      processing: PaymentStatus.PENDING,
      requires_payment_method: PaymentStatus.PENDING,
      requires_confirmation: PaymentStatus.PENDING,
      requires_action: PaymentStatus.PENDING,
      canceled: PaymentStatus.CANCELED,
      requires_capture: PaymentStatus.PENDING,
    };

    return statusMap[status] || PaymentStatus.FAILED;
  }

  /**
   * Crea un cliente en Stripe
   */
  async createCustomer(userId: string, email: string, name: string): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    return customer.id;
  }

  /**
   * Asocia un método de pago a un cliente
   */
  async attachPaymentMethodToCustomer(paymentMethodId: string, customerId: string): Promise<void> {
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }
}

export const cardPaymentService = new CardPaymentService();
