import { analyticsController } from '../../../src/controllers/analyticsController';
import { subscriptionAnalyticsService } from '../../../src/services/SubscriptionAnalyticsService';
import { mockRequest, mockResponse } from '../../helpers/mockRequest';

// Mock de servicios
jest.mock('../../../src/services/SubscriptionAnalyticsService');

describe('AnalyticsController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('debería obtener dashboard completo de analytics', async () => {
      const req = mockRequest({
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });
      const res = mockResponse();

      const mockDashboard = {
        revenue: {
          total: 100000,
          monthly: 10000,
          growth: 15.5,
        },
        subscriptions: {
          total: 500,
          active: 450,
          trial: 30,
          canceled: 20,
        },
        payments: {
          totalTransactions: 1000,
          successful: 950,
          failed: 50,
        },
      };

      (subscriptionAnalyticsService.getDashboard as jest.Mock).mockResolvedValue(mockDashboard);

      await analyticsController.getDashboard(req as any, res as any);

      expect(subscriptionAnalyticsService.getDashboard).toHaveBeenCalledWith({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDashboard,
      });
    });

    it('debería usar periodo por defecto si no se especifican fechas', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();

      (subscriptionAnalyticsService.getDashboard as jest.Mock).mockResolvedValue({});

      await analyticsController.getDashboard(req as any, res as any);

      expect(subscriptionAnalyticsService.getDashboard).toHaveBeenCalledWith({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
    });

    it('debería manejar errores al obtener dashboard', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();

      (subscriptionAnalyticsService.getDashboard as jest.Mock).mockRejectedValue(
        new Error('Analytics error')
      );

      await analyticsController.getDashboard(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener dashboard de analytics',
        error: 'Analytics error',
      });
    });
  });

  describe('getRevenueMetrics', () => {
    it('debería obtener métricas de ingresos', async () => {
      const req = mockRequest({
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });
      const res = mockResponse();

      const mockMetrics = {
        totalRevenue: 100000,
        monthlyRecurring: 50000,
        oneTime: 50000,
        averageRevenuePerUser: 200,
        growth: {
          percentage: 10.5,
          amount: 9500,
        },
      };

      (subscriptionAnalyticsService.getRevenueMetrics as jest.Mock).mockResolvedValue(
        mockMetrics
      );

      await analyticsController.getRevenueMetrics(req as any, res as any);

      expect(subscriptionAnalyticsService.getRevenueMetrics).toHaveBeenCalledWith({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMetrics,
      });
    });

    it('debería usar periodo por defecto (últimos 30 días)', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();

      (subscriptionAnalyticsService.getRevenueMetrics as jest.Mock).mockResolvedValue({});

      await analyticsController.getRevenueMetrics(req as any, res as any);

      expect(subscriptionAnalyticsService.getRevenueMetrics).toHaveBeenCalled();
    });

    it('debería manejar errores', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();

      (subscriptionAnalyticsService.getRevenueMetrics as jest.Mock).mockRejectedValue(
        new Error('Revenue metrics error')
      );

      await analyticsController.getRevenueMetrics(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener métricas de ingresos',
        error: 'Revenue metrics error',
      });
    });
  });

  describe('getSubscriptionMetrics', () => {
    it('debería obtener métricas de suscripciones', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockMetrics = {
        total: 500,
        active: 450,
        trial: 30,
        canceled: 20,
        byPlan: {
          basic: 200,
          premium: 250,
          enterprise: 50,
        },
        churnRate: 4.5,
      };

      (subscriptionAnalyticsService.getSubscriptionMetrics as jest.Mock).mockResolvedValue(
        mockMetrics
      );

      await analyticsController.getSubscriptionMetrics(req as any, res as any);

      expect(subscriptionAnalyticsService.getSubscriptionMetrics).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMetrics,
      });
    });

    it('debería manejar errores', async () => {
      const req = mockRequest();
      const res = mockResponse();

      (subscriptionAnalyticsService.getSubscriptionMetrics as jest.Mock).mockRejectedValue(
        new Error('Subscription metrics error')
      );

      await analyticsController.getSubscriptionMetrics(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener métricas de suscripciones',
        error: 'Subscription metrics error',
      });
    });
  });

  describe('getGrowthMetrics', () => {
    it('debería obtener métricas de crecimiento', async () => {
      const req = mockRequest({
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });
      const res = mockResponse();

      const mockMetrics = {
        newSubscriptions: 50,
        cancellations: 10,
        netGrowth: 40,
        growthRate: 8.9,
        retention: 95.5,
      };

      (subscriptionAnalyticsService.getGrowthMetrics as jest.Mock).mockResolvedValue(
        mockMetrics
      );

      await analyticsController.getGrowthMetrics(req as any, res as any);

      expect(subscriptionAnalyticsService.getGrowthMetrics).toHaveBeenCalledWith({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMetrics,
      });
    });

    it('debería usar periodo por defecto', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();

      (subscriptionAnalyticsService.getGrowthMetrics as jest.Mock).mockResolvedValue({});

      await analyticsController.getGrowthMetrics(req as any, res as any);

      expect(subscriptionAnalyticsService.getGrowthMetrics).toHaveBeenCalled();
    });

    it('debería manejar errores', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();

      (subscriptionAnalyticsService.getGrowthMetrics as jest.Mock).mockRejectedValue(
        new Error('Growth metrics error')
      );

      await analyticsController.getGrowthMetrics(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener métricas de crecimiento',
        error: 'Growth metrics error',
      });
    });
  });

  describe('getPaymentMetrics', () => {
    it('debería obtener métricas de pagos', async () => {
      const req = mockRequest({
        query: {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });
      const res = mockResponse();

      const mockMetrics = {
        totalTransactions: 1000,
        successful: 950,
        failed: 50,
        successRate: 95.0,
        totalAmount: 100000,
        averageTransaction: 100,
        byProvider: {
          stripe: 600,
          paypal: 400,
        },
      };

      (subscriptionAnalyticsService.getPaymentMetrics as jest.Mock).mockResolvedValue(
        mockMetrics
      );

      await analyticsController.getPaymentMetrics(req as any, res as any);

      expect(subscriptionAnalyticsService.getPaymentMetrics).toHaveBeenCalledWith({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockMetrics,
      });
    });

    it('debería usar periodo por defecto', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();

      (subscriptionAnalyticsService.getPaymentMetrics as jest.Mock).mockResolvedValue({});

      await analyticsController.getPaymentMetrics(req as any, res as any);

      expect(subscriptionAnalyticsService.getPaymentMetrics).toHaveBeenCalled();
    });

    it('debería manejar errores', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();

      (subscriptionAnalyticsService.getPaymentMetrics as jest.Mock).mockRejectedValue(
        new Error('Payment metrics error')
      );

      await analyticsController.getPaymentMetrics(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener métricas de pagos',
        error: 'Payment metrics error',
      });
    });
  });

  describe('getSubscriptionTrends', () => {
    it('debería obtener tendencias de suscripciones', async () => {
      const req = mockRequest({
        query: { months: '12' },
      });
      const res = mockResponse();

      const mockTrends = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: {
          newSubscriptions: [10, 15, 20, 18, 22, 25, 30, 28, 35, 40, 38, 45],
          cancellations: [2, 3, 1, 2, 3, 2, 4, 3, 5, 4, 6, 5],
          activeSubscriptions: [100, 115, 134, 150, 169, 192, 218, 243, 273, 309, 341, 381],
        },
      };

      (subscriptionAnalyticsService.getSubscriptionTrends as jest.Mock).mockResolvedValue(
        mockTrends
      );

      await analyticsController.getSubscriptionTrends(req as any, res as any);

      expect(subscriptionAnalyticsService.getSubscriptionTrends).toHaveBeenCalledWith(12);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTrends,
      });
    });

    it('debería usar 12 meses por defecto', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();

      (subscriptionAnalyticsService.getSubscriptionTrends as jest.Mock).mockResolvedValue({});

      await analyticsController.getSubscriptionTrends(req as any, res as any);

      expect(subscriptionAnalyticsService.getSubscriptionTrends).toHaveBeenCalledWith(12);
    });

    it('debería aceptar número de meses personalizado', async () => {
      const req = mockRequest({
        query: { months: '6' },
      });
      const res = mockResponse();

      (subscriptionAnalyticsService.getSubscriptionTrends as jest.Mock).mockResolvedValue({});

      await analyticsController.getSubscriptionTrends(req as any, res as any);

      expect(subscriptionAnalyticsService.getSubscriptionTrends).toHaveBeenCalledWith(6);
    });

    it('debería manejar errores', async () => {
      const req = mockRequest({
        query: {},
      });
      const res = mockResponse();

      (subscriptionAnalyticsService.getSubscriptionTrends as jest.Mock).mockRejectedValue(
        new Error('Trends error')
      );

      await analyticsController.getSubscriptionTrends(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Error al obtener tendencias de suscripciones',
        error: 'Trends error',
      });
    });
  });
});
