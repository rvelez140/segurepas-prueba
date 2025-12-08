import { Router } from 'express';
import { auditController } from '../controllers/auditController';
import { readLimiter } from '../middlewares/rateLimitMiddleware';

const router = Router();

// Obtener logs de auditoría (solo admin)
router.get('/audit/logs', readLimiter, auditController.getLogs);

// Obtener estadísticas de auditoría (solo admin)
router.get('/audit/stats', readLimiter, auditController.getStats);

// Obtener logs de un usuario específico (admin o el propio usuario)
router.get('/audit/user/:userId', readLimiter, auditController.getUserLogs);

// Obtener acciones fallidas (solo admin)
router.get('/audit/failed', readLimiter, auditController.getFailedActions);

// Limpiar logs antiguos (solo admin)
router.delete('/audit/clean', auditController.cleanOldLogs);

export default router;
