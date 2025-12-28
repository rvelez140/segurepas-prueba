import { paymentController } from '../../../src/controllers/paymentController';
import { cardPaymentService } from '../../../src/services/CardPaymentService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';
import { mockObjectId } from '../../helpers/mockModels';

// Mock de servicios
jest.mock('../../../src/services/CardPaymentService');

describe('PaymentController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('debería crear payment intent exitosamente', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          amount: 10000,
          currency: 'USD',
          description: 'Test payment',
        },
      });
      const res = mockResponse();

      const mockResult = {
        clientSecret: 'pi_test_secret',
        paymentIntentId: 'pi_test_123',
      };

      (cardPaymentService.createPaymentIntent as jest.Mock).mockResolvedValue(mockResult);

      await paymentController.createPaymentIntent(req as any, res as any);

      expect(cardPaymentService.createPaymentIntent).toHaveBeenCalledWith(
        expect.any(String),
        10000,
        'USD',
        'Test payment',
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        clientSecret: mockResult.clientSecret,
        paymentIntentId: mockResult.paymentIntentId,
      });
    });

    it('debería usar USD como moneda por defecto', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          amount: 10000,
        },
      });
      const res = mockResponse();

      const mockResult = {
        clientSecret: 'pi_test_secret',
        paymentIntentId: 'pi_test_123',
      };

      (cardPaymentService.createPaymentIntent as jest.Mock).mockResolvedValue(mockResult);

      await paymentController.createPaymentIntent(req as any, res as any);

      expect(cardPaymentService.createPaymentIntent).toHaveBeenCalledWith(
        expect.any(String),
        10000,
        'USD',
        undefined,
        undefined
      );
    });

    it('debería retornar 400 si faltan parámetros requeridos', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
        },
      });
      const res = mockResponse();

      await paymentController.createPaymentIntent(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'userId y amount son requeridos',
      });
    });

    it('debería manejar errores al crear payment intent', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          amount: 10000,
        },
      });
      const res = mockResponse();

      (cardPaymentService.createPaymentIntent as jest.Mock).mockRejectedValue(
        new Error('Stripe error')
      );

      await paymentController.createPaymentIntent(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al crear payment intent',
        error: 'Stripe error',
      });
    });
  });

  describe('processCardPayment', () => {
    it('debería procesar pago con tarjeta exitosamente', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          paymentMethodId: 'pm_test_123',
          amount: 5000,
          currency: 'USD',
        },
      });
      const res = mockResponse();

      const mockResult = {
        payment: { _id: mockObjectId(), status: 'succeeded' },
        paymentIntent: { id: 'pi_test', status: 'succeeded' },
      };

      (cardPaymentService.processCardPayment as jest.Mock).mockResolvedValue(mockResult);

      await paymentController.processCardPayment(req as any, res as any);

      expect(cardPaymentService.processCardPayment).toHaveBeenCalledWith(
        expect.any(String),
        'pm_test_123',
        5000,
        'USD',
        undefined,
        undefined
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        payment: mockResult.payment,
        paymentIntent: mockResult.paymentIntent,
      });
    });

    it('debería retornar 400 si faltan parámetros requeridos', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          amount: 5000,
        },
      });
      const res = mockResponse();

      await paymentController.processCardPayment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'userId, paymentMethodId y amount son requeridos',
      });
    });

    it('debería manejar errores de pago', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          paymentMethodId: 'pm_test_123',
          amount: 5000,
        },
      });
      const res = mockResponse();

      (cardPaymentService.processCardPayment as jest.Mock).mockRejectedValue(
        new Error('Tarjeta rechazada')
      );

      await paymentController.processCardPayment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al procesar el pago',
        error: 'Tarjeta rechazada',
      });
    });
  });

  describe('createSetupIntent', () => {
    it('debería crear setup intent exitosamente', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
        },
      });
      const res = mockResponse();

      const mockResult = {
        clientSecret: 'seti_test_secret',
        setupIntentId: 'seti_test_123',
      };

      (cardPaymentService.createSetupIntent as jest.Mock).mockResolvedValue(mockResult);

      await paymentController.createSetupIntent(req as any, res as any);

      expect(cardPaymentService.createSetupIntent).toHaveBeenCalledWith(expect.any(String));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        clientSecret: mockResult.clientSecret,
        setupIntentId: mockResult.setupIntentId,
      });
    });

    it('debería retornar 400 si falta userId', async () => {
      const req = mockRequest({
        body: {},
      });
      const res = mockResponse();

      await paymentController.createSetupIntent(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'userId es requerido',
      });
    });
  });

  describe('getPaymentMethods', () => {
    it('debería obtener métodos de pago del usuario', async () => {
      const customerId = 'cus_test_123';
      const req = mockRequest({
        params: { customerId },
      });
      const res = mockResponse();

      const mockPaymentMethods = [
        { id: 'pm_1', type: 'card', card: { last4: '4242' } },
        { id: 'pm_2', type: 'card', card: { last4: '5555' } },
      ];

      (cardPaymentService.getPaymentMethods as jest.Mock).mockResolvedValue(
        mockPaymentMethods
      );

      await paymentController.getPaymentMethods(req as any, res as any);

      expect(cardPaymentService.getPaymentMethods).toHaveBeenCalledWith(customerId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        paymentMethods: mockPaymentMethods,
      });
    });

    it('debería manejar errores al obtener métodos de pago', async () => {
      const customerId = 'cus_test_123';
      const req = mockRequest({
        params: { customerId },
      });
      const res = mockResponse();

      (cardPaymentService.getPaymentMethods as jest.Mock).mockRejectedValue(
        new Error('Customer not found')
      );

      await paymentController.getPaymentMethods(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener métodos de pago',
        error: 'Customer not found',
      });
    });
  });

  describe('detachPaymentMethod', () => {
    it('debería eliminar método de pago exitosamente', async () => {
      const paymentMethodId = 'pm_test_123';
      const req = mockRequest({
        params: { paymentMethodId },
      });
      const res = mockResponse();

      (cardPaymentService.detachPaymentMethod as jest.Mock).mockResolvedValue(undefined);

      await paymentController.detachPaymentMethod(req as any, res as any);

      expect(cardPaymentService.detachPaymentMethod).toHaveBeenCalledWith(paymentMethodId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Método de pago eliminado',
      });
    });

    it('debería manejar errores al eliminar método de pago', async () => {
      const paymentMethodId = 'pm_test_123';
      const req = mockRequest({
        params: { paymentMethodId },
      });
      const res = mockResponse();

      (cardPaymentService.detachPaymentMethod as jest.Mock).mockRejectedValue(
        new Error('Payment method not found')
      );

      await paymentController.detachPaymentMethod(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al eliminar método de pago',
        error: 'Payment method not found',
      });
    });
  });

  describe('refundPayment', () => {
    it('debería procesar reembolso exitosamente', async () => {
      const paymentId = mockObjectId().toString();
      const req = mockRequest({
        params: { paymentId },
        body: {
          amount: 5000,
          reason: 'requested_by_customer',
        },
      });
      const res = mockResponse();

      const mockResult = {
        refund: { id: 're_test_123', status: 'succeeded' },
        refundPayment: { _id: paymentId, status: 'refunded' },
      };

      (cardPaymentService.refundPayment as jest.Mock).mockResolvedValue(mockResult);

      await paymentController.refundPayment(req as any, res as any);

      expect(cardPaymentService.refundPayment).toHaveBeenCalledWith(
        paymentId,
        5000,
        'requested_by_customer'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        refund: mockResult.refund,
        refundPayment: mockResult.refundPayment,
      });
    });

    it('debería manejar errores al procesar reembolso', async () => {
      const paymentId = mockObjectId().toString();
      const req = mockRequest({
        params: { paymentId },
        body: {
          amount: 5000,
        },
      });
      const res = mockResponse();

      (cardPaymentService.refundPayment as jest.Mock).mockRejectedValue(
        new Error('Payment not found')
      );

      await paymentController.refundPayment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al procesar reembolso',
        error: 'Payment not found',
      });
    });
  });

  describe('getUserPayments', () => {
    it('debería obtener historial de pagos del usuario', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
        query: { limit: '20', offset: '0' },
      });
      const res = mockResponse();

      const mockResult = {
        payments: [{ _id: mockObjectId(), amount: 1000 }],
        total: 50,
        hasMore: true,
      };

      (cardPaymentService.getUserPayments as jest.Mock).mockResolvedValue(mockResult);

      await paymentController.getUserPayments(req as any, res as any);

      expect(cardPaymentService.getUserPayments).toHaveBeenCalledWith(userId, 20, 0);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ...mockResult,
      });
    });

    it('debería usar valores por defecto para limit y offset', async () => {
      const userId = mockObjectId().toString();
      const req = mockRequest({
        params: { userId },
        query: {},
      });
      const res = mockResponse();

      const mockResult = {
        payments: [],
        total: 0,
        hasMore: false,
      };

      (cardPaymentService.getUserPayments as jest.Mock).mockResolvedValue(mockResult);

      await paymentController.getUserPayments(req as any, res as any);

      expect(cardPaymentService.getUserPayments).toHaveBeenCalledWith(userId, 10, 0);
    });
  });

  describe('getPaymentById', () => {
    it('debería obtener un pago específico por ID', async () => {
      const paymentId = mockObjectId().toString();
      const req = mockRequest({
        params: { paymentId },
      });
      const res = mockResponse();

      const mockPayment = {
        _id: paymentId,
        amount: 10000,
        status: 'succeeded',
      };

      (cardPaymentService.getPaymentById as jest.Mock).mockResolvedValue(mockPayment);

      await paymentController.getPaymentById(req as any, res as any);

      expect(cardPaymentService.getPaymentById).toHaveBeenCalledWith(paymentId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        payment: mockPayment,
      });
    });

    it('debería retornar 404 si el pago no existe', async () => {
      const paymentId = mockObjectId().toString();
      const req = mockRequest({
        params: { paymentId },
      });
      const res = mockResponse();

      (cardPaymentService.getPaymentById as jest.Mock).mockResolvedValue(null);

      await paymentController.getPaymentById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Pago no encontrado',
      });
    });
  });

  describe('createCustomer', () => {
    it('debería crear un cliente de Stripe exitosamente', async () => {
      const req = mockRequest({
        body: {
          userId: mockObjectId().toString(),
          email: 'test@example.com',
          name: 'Test User',
        },
      });
      const res = mockResponse();

      const customerId = 'cus_test_123';

      (cardPaymentService.createCustomer as jest.Mock).mockResolvedValue(customerId);

      await paymentController.createCustomer(req as any, res as any);

      expect(cardPaymentService.createCustomer).toHaveBeenCalledWith(
        expect.any(String),
        'test@example.com',
        'Test User'
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        customerId,
      });
    });

    it('debería retornar 400 si faltan parámetros requeridos', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
        },
      });
      const res = mockResponse();

      await paymentController.createCustomer(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'userId, email y name son requeridos',
      });
    });
  });
});
