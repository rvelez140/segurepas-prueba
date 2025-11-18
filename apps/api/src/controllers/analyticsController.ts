import { Request, Response } from 'express';
import { subscriptionAnalyticsService } from '../services/SubscriptionAnalyticsService';

export class AnalyticsController {
  /**
   * Obtiene el dashboard completo de analytics
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const period = {
        startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      const dashboard = await subscriptionAnalyticsService.getDashboard(period);

      res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener dashboard de analytics',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene métricas de ingresos
   */
  async getRevenueMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const period = {
        startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      const metrics = await subscriptionAnalyticsService.getRevenueMetrics(period);

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas de ingresos',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene métricas de suscripciones
   */
  async getSubscriptionMetrics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await subscriptionAnalyticsService.getSubscriptionMetrics();

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas de suscripciones',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene métricas de crecimiento
   */
  async getGrowthMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const period = {
        startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      const metrics = await subscriptionAnalyticsService.getGrowthMetrics(period);

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas de crecimiento',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene métricas de pagos
   */
  async getPaymentMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const period = {
        startDate: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate ? new Date(endDate as string) : new Date(),
      };

      const metrics = await subscriptionAnalyticsService.getPaymentMetrics(period);

      res.status(200).json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener métricas de pagos',
        error: error.message,
      });
    }
  }

  /**
   * Obtiene tendencias de suscripciones
   */
  async getSubscriptionTrends(req: Request, res: Response): Promise<void> {
    try {
      const { months } = req.query;
      const monthsNumber = months ? parseInt(months as string, 10) : 12;

      const trends = await subscriptionAnalyticsService.getSubscriptionTrends(monthsNumber);

      res.status(200).json({
        success: true,
        data: trends,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener tendencias de suscripciones',
        error: error.message,
      });
    }
  }
}

export const analyticsController = new AnalyticsController();
