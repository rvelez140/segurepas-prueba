import { subscriptionController } from '../../../src/controllers/subscriptionController';
import { stripePaymentService } from '../../../src/services/StripePaymentService';
import { paypalPaymentService } from '../../../src/services/PayPalPaymentService';
import { Subscription } from '../../../src/models/Subscription';
import { UserService } from '../../../src/services/UserService';
import { notificationService } from '../../../src/services/NotificationService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockUser, mockObjectId } from '../../helpers/mockModels';

// Mock de servicios y modelos
jest.mock('../../../src/services/StripePaymentService');
jest.mock('../../../src/services/PayPalPaymentService');
jest.mock('../../../src/models/Subscription');
jest.mock('../../../src/services/UserService');
jest.mock('../../../src/services/NotificationService');

describe('SubscriptionController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createStripeCheckout', () => {
    it('debería crear sesión de checkout de Stripe exitosamente', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          plan: 'premium',
          billingCycle: 'monthly',
        },
      });
      const res = mockResponse();

      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      };

      (stripePaymentService.createCheckoutSession as jest.Mock).mockResolvedValue(mockSession);

      await subscriptionController.createStripeCheckout(req as any, res as any);

      expect(stripePaymentService.createCheckoutSession).toHaveBeenCalledWith(
        expect.any(String),
        'premium',
        'monthly',
        expect.stringContaining('/subscription/success'),
        expect.stringContaining('/subscription/cancel')
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        sessionId: mockSession.id,
        url: mockSession.url,
      });
    });

    it('debería manejar errores al crear checkout', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          plan: 'premium',
          billingCycle: 'monthly',
        },
      });
      const res = mockResponse();

      (stripePaymentService.createCheckoutSession as jest.Mock).mockRejectedValue(
        new Error('Stripe error')
      );

      await subscriptionController.createStripeCheckout(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al crear sesión de checkout',
        error: 'Stripe error',
      });
    });
  });

  describe('createPayPalSubscription', () => {
    it('debería crear suscripción de PayPal exitosamente', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          plan: 'premium',
          billingCycle: 'monthly',
        },
      });
      const res = mockResponse();

      const mockResult = {
        subscriptionId: 'I-TEST123',
        approvalUrl: 'https://paypal.com/approve/test',
      };

      (paypalPaymentService.createSubscription as jest.Mock).mockResolvedValue(mockResult);

      await subscriptionController.createPayPalSubscription(req as any, res as any);

      expect(paypalPaymentService.createSubscription).toHaveBeenCalledWith(
        expect.any(String),
        'premium',
        'monthly',
        expect.stringContaining('/subscription/success'),
        expect.stringContaining('/subscription/cancel')
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        subscriptionId: mockResult.subscriptionId,
        approvalUrl: mockResult.approvalUrl,
      });
    });

    it('debería manejar errores al crear suscripción PayPal', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          plan: 'premium',
          billingCycle: 'monthly',
        },
      });
      const res = mockResponse();

      (paypalPaymentService.createSubscription as jest.Mock).mockRejectedValue(
        new Error('PayPal error')
      );

      await subscriptionController.createPayPalSubscription(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al crear suscripción de PayPal',
        error: 'PayPal error',
      });
    });
  });

  describe('activatePayPalSubscription', () => {
    it('debería activar suscripción de PayPal exitosamente', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          subscriptionId: 'I-TEST123',
        },
      });
      const res = mockResponse();

      const mockSubscription = {
        _id: mockObjectId(),
        userId: mockObjectId(),
        status: 'active',
      };

      (paypalPaymentService.activateSubscription as jest.Mock).mockResolvedValue(
        mockSubscription
      );
      (UserService.findById as jest.Mock).mockResolvedValue(mockUser);
      (notificationService.sendSubscriptionWelcome as jest.Mock).mockResolvedValue(undefined);

      await subscriptionController.activatePayPalSubscription(req as any, res as any);

      expect(paypalPaymentService.activateSubscription).toHaveBeenCalled();
      expect(UserService.findById).toHaveBeenCalled();
      expect(notificationService.sendSubscriptionWelcome).toHaveBeenCalledWith(
        mockUser.auth.email,
        mockUser.name,
        mockSubscription
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        subscription: mockSubscription,
      });
    });

    it('debería manejar errores al activar suscripción', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          subscriptionId: 'I-TEST123',
        },
      });
      const res = mockResponse();

      (paypalPaymentService.activateSubscription as jest.Mock).mockRejectedValue(
        new Error('Subscription not found')
      );

      await subscriptionController.activatePayPalSubscription(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al activar suscripción',
        error: 'Subscription not found',
      });
    });
  });

  describe('getUserSubscriptions', () => {
    it('debería obtener suscripciones del usuario', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
      });
      const res = mockResponse();

      const mockSubscriptions = [
        { _id: mockObjectId(), status: 'active' },
        { _id: mockObjectId(), status: 'canceled' },
      ];

      (Subscription.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockSubscriptions),
      });

      await subscriptionController.getUserSubscriptions(req as any, res as any);

      expect(Subscription.find).toHaveBeenCalledWith({ userId });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        subscriptions: mockSubscriptions,
      });
    });

    it('debería manejar errores al obtener suscripciones', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
      });
      const res = mockResponse();

      (Subscription.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await subscriptionController.getUserSubscriptions(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener suscripciones',
        error: 'Database error',
      });
    });
  });

  describe('getActiveSubscription', () => {
    it('debería obtener suscripción activa del usuario', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
      });
      const res = mockResponse();

      const mockSubscription = {
        _id: mockObjectId(),
        userId,
        status: 'active',
      };

      (Subscription.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockSubscription),
      });

      await subscriptionController.getActiveSubscription(req as any, res as any);

      expect(Subscription.findOne).toHaveBeenCalledWith({
        userId,
        status: { $in: ['active', 'trial'] },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        subscription: mockSubscription,
      });
    });

    it('debería retornar null si no hay suscripción activa', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
      });
      const res = mockResponse();

      (Subscription.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      await subscriptionController.getActiveSubscription(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        subscription: null,
      });
    });
  });

  describe('cancelSubscription', () => {
    it('debería cancelar suscripción de Stripe exitosamente', async () => {
      const subscriptionId = mockObjectId().toString();
      const req = mockRequest({
        params: { subscriptionId },
        body: { reason: 'Too expensive' },
      });
      const res = mockResponse();

      const mockSubscription = {
        _id: subscriptionId,
        userId: mockObjectId(),
        provider: 'stripe',
      };

      const mockCanceledSubscription = {
        ...mockSubscription,
        status: 'canceled',
      };

      (Subscription.findById as jest.Mock).mockResolvedValue(mockSubscription);
      (stripePaymentService.cancelSubscription as jest.Mock).mockResolvedValue(
        mockCanceledSubscription
      );
      (UserService.findById as jest.Mock).mockResolvedValue(mockUser);
      (notificationService.sendSubscriptionCanceled as jest.Mock).mockResolvedValue(undefined);

      await subscriptionController.cancelSubscription(req as any, res as any);

      expect(stripePaymentService.cancelSubscription).toHaveBeenCalledWith(subscriptionId);
      expect(notificationService.sendSubscriptionCanceled).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        subscription: mockCanceledSubscription,
      });
    });

    it('debería cancelar suscripción de PayPal exitosamente', async () => {
      const subscriptionId = mockObjectId().toString();
      const req = mockRequest({
        params: { subscriptionId },
        body: { reason: 'Not satisfied' },
      });
      const res = mockResponse();

      const mockSubscription = {
        _id: subscriptionId,
        userId: mockObjectId(),
        provider: 'paypal',
      };

      const mockCanceledSubscription = {
        ...mockSubscription,
        status: 'canceled',
      };

      (Subscription.findById as jest.Mock).mockResolvedValue(mockSubscription);
      (paypalPaymentService.cancelSubscription as jest.Mock).mockResolvedValue(
        mockCanceledSubscription
      );
      (UserService.findById as jest.Mock).mockResolvedValue(mockUser);
      (notificationService.sendSubscriptionCanceled as jest.Mock).mockResolvedValue(undefined);

      await subscriptionController.cancelSubscription(req as any, res as any);

      expect(paypalPaymentService.cancelSubscription).toHaveBeenCalledWith(
        subscriptionId,
        'Not satisfied'
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debería retornar 404 si la suscripción no existe', async () => {
      const subscriptionId = mockObjectId().toString();
      const req = mockRequest({
        params: { subscriptionId },
        body: {},
      });
      const res = mockResponse();

      (Subscription.findById as jest.Mock).mockResolvedValue(null);

      await subscriptionController.cancelSubscription(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Suscripción no encontrada',
      });
    });

    it('debería manejar errores al cancelar suscripción', async () => {
      const subscriptionId = mockObjectId().toString();
      const req = mockRequest({
        params: { subscriptionId },
        body: {},
      });
      const res = mockResponse();

      (Subscription.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      await subscriptionController.cancelSubscription(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al cancelar suscripción',
        error: 'Database error',
      });
    });
  });

  describe('stripeWebhook', () => {
    it('debería procesar webhook de Stripe exitosamente', async () => {
      const req = mockRequest({
        headers: { 'stripe-signature': 'sig_test_123' },
        body: { type: 'payment_intent.succeeded', data: {} },
      });
      const res = mockResponse();

      (stripePaymentService.handleWebhook as jest.Mock).mockResolvedValue(undefined);

      await subscriptionController.stripeWebhook(req as any, res as any);

      expect(stripePaymentService.handleWebhook).toHaveBeenCalledWith(
        expect.any(Object),
        'sig_test_123'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('debería manejar errores de webhook', async () => {
      const req = mockRequest({
        headers: { 'stripe-signature': 'invalid_sig' },
        body: {},
      });
      const res = mockResponse();

      (stripePaymentService.handleWebhook as jest.Mock).mockRejectedValue(
        new Error('Invalid signature')
      );

      await subscriptionController.stripeWebhook(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al procesar webhook',
        error: 'Invalid signature',
      });
    });
  });

  describe('paypalWebhook', () => {
    it('debería procesar webhook de PayPal exitosamente', async () => {
      const req = mockRequest({
        body: {
          event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
          resource: {},
        },
      });
      const res = mockResponse();

      (paypalPaymentService.handleWebhook as jest.Mock).mockResolvedValue(undefined);

      await subscriptionController.paypalWebhook(req as any, res as any);

      expect(paypalPaymentService.handleWebhook).toHaveBeenCalledWith(expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ received: true });
    });

    it('debería manejar errores de webhook PayPal', async () => {
      const req = mockRequest({
        body: { event_type: 'UNKNOWN_EVENT' },
      });
      const res = mockResponse();

      (paypalPaymentService.handleWebhook as jest.Mock).mockRejectedValue(
        new Error('Unknown event type')
      );

      await subscriptionController.paypalWebhook(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al procesar webhook',
        error: 'Unknown event type',
      });
    });
  });
});
