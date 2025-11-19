import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';

const router = Router();

// Ruta principal del dashboard
router.get('/analytics/dashboard', analyticsController.getDashboard.bind(analyticsController));

// Métricas específicas
router.get('/analytics/revenue', analyticsController.getRevenueMetrics.bind(analyticsController));
router.get('/analytics/subscriptions', analyticsController.getSubscriptionMetrics.bind(analyticsController));
router.get('/analytics/growth', analyticsController.getGrowthMetrics.bind(analyticsController));
router.get('/analytics/payments', analyticsController.getPaymentMetrics.bind(analyticsController));

// Tendencias
router.get('/analytics/trends', analyticsController.getSubscriptionTrends.bind(analyticsController));

export default router;
