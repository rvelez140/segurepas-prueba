import { Request, Response } from 'express';
import { stripePaymentService } from '../services/StripePaymentService';
import { paypalPaymentService } from '../services/PayPalPaymentService';
import { Subscription } from '../models/Subscription';
import { notificationService } from '../services/NotificationService';
import { UserService } from '../services/UserService';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

export class SubscriptionController {
  /**
   * Crea una sesión de checkout de Stripe
   */
  async createStripeCheckout(req: Request, res: Response): Promise<void> {
    try {
      const { userId, plan, billingCycle } = req.body;
      const successUrl = `${process.env.FRONTEND_URL}/subscription/success`;
      const cancelUrl = `${process.env.FRONTEND_URL}/subscription/cancel`;

      const session = await stripePaymentService.createCheckoutSession(
        userId,
        plan,
        billingCycle,
        successUrl,
        cancelUrl
      );

      res.status(200).json({
        success: true,
        sessionId: session.id,
        url: session.url,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al crear sesión de checkout',
        error: getErrorMessage(error),
      });
    }
  }

  /**
   * Crea una suscripción de PayPal
   */
  async createPayPalSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { userId, plan, billingCycle } = req.body;
      const returnUrl = `${process.env.FRONTEND_URL}/subscription/success`;
      const cancelUrl = `${process.env.FRONTEND_URL}/subscription/cancel`;

      const result = await paypalPaymentService.createSubscription(
        userId,
        plan,
        billingCycle,
        returnUrl,
        cancelUrl
      );

      res.status(200).json({
        success: true,
        subscriptionId: result.subscriptionId,
        approvalUrl: result.approvalUrl,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al crear suscripción de PayPal',
        error: getErrorMessage(error),
      });
    }
  }

  /**
   * Activa una suscripción de PayPal después de aprobación
   */
  async activatePayPalSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { userId, subscriptionId } = req.body;

      const subscription = await paypalPaymentService.activateSubscription(userId, subscriptionId);

      // Enviar email de bienvenida
      const user = await UserService.findById(userId);
      if (user) {
        await notificationService.sendSubscriptionWelcome(user.auth.email, user.name, subscription);
      }

      res.status(200).json({
        success: true,
        subscription,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al activar suscripción',
        error: getErrorMessage(error),
      });
    }
  }

  /**
   * Obtiene las suscripciones de un usuario
   */
  async getUserSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const subscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        subscriptions,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener suscripciones',
        error: getErrorMessage(error),
      });
    }
  }

  /**
   * Obtiene la suscripción activa de un usuario
   */
  async getActiveSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const subscription = await Subscription.findOne({
        userId,
        status: { $in: ['active', 'trial'] },
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        subscription,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener suscripción activa',
        error: getErrorMessage(error),
      });
    }
  }

  /**
   * Cancela una suscripción
   */
  async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const { subscriptionId } = req.params;
      const { reason } = req.body;

      const subscription = await Subscription.findById(subscriptionId);
      if (!subscription) {
        res.status(404).json({
          success: false,
          message: 'Suscripción no encontrada',
        });
        return;
      }

      let canceledSubscription;
      if (subscription.provider === 'stripe') {
        canceledSubscription = await stripePaymentService.cancelSubscription(subscriptionId);
      } else {
        canceledSubscription = await paypalPaymentService.cancelSubscription(
          subscriptionId,
          reason
        );
      }

      // Enviar email de cancelación
      const user = await UserService.findById(subscription.userId.toString());
      if (user) {
        await notificationService.sendSubscriptionCanceled(
          user.auth.email,
          user.name,
          canceledSubscription
        );
      }

      res.status(200).json({
        success: true,
        subscription: canceledSubscription,
      });
    } catch (error: unknown) {
      res.status(500).json({
        success: false,
        message: 'Error al cancelar suscripción',
        error: getErrorMessage(error),
      });
    }
  }

  /**
   * Webhook de Stripe
   */
  async stripeWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body;

      await stripePaymentService.handleWebhook(payload, signature);

      res.status(200).json({ received: true });
    } catch (error: unknown) {
      console.error('Error en webhook de Stripe:', error);
      res.status(400).json({
        success: false,
        message: 'Error al procesar webhook',
        error: getErrorMessage(error),
      });
    }
  }

  /**
   * Webhook de PayPal
   */
  async paypalWebhook(req: Request, res: Response): Promise<void> {
    try {
      const webhookEvent = req.body;

      await paypalPaymentService.handleWebhook(webhookEvent);

      res.status(200).json({ received: true });
    } catch (error: unknown) {
      console.error('Error en webhook de PayPal:', error);
      res.status(400).json({
        success: false,
        message: 'Error al procesar webhook',
        error: getErrorMessage(error),
      });
    }
  }
}

export const subscriptionController = new SubscriptionController();
