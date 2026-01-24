import { Router } from 'express';
import { auditController } from '../controllers/auditController';
import { readLimiter } from '../middlewares/rateLimitMiddleware';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Obtener logs de auditoría (solo admin)
router.get(
  '/audit/logs',
  authMiddleware,
  roleMiddleware(['admin']),
  readLimiter,
  auditController.getLogs
);

// Obtener estadísticas de auditoría (solo admin)
router.get(
  '/audit/stats',
  authMiddleware,
  roleMiddleware(['admin']),
  readLimiter,
  auditController.getStats
);

// Obtener logs de un usuario específico (admin o el propio usuario)
// TODO: Implementar validación para permitir que el propio usuario vea sus logs
router.get(
  '/audit/user/:userId',
  authMiddleware,
  roleMiddleware(['admin']),
  readLimiter,
  auditController.getUserLogs
);

// Obtener acciones fallidas (solo admin)
router.get(
  '/audit/failed',
  authMiddleware,
  roleMiddleware(['admin']),
  readLimiter,
  auditController.getFailedActions
);

// Limpiar logs antiguos (solo admin)
router.delete(
  '/audit/clean',
  authMiddleware,
  roleMiddleware(['admin']),
  auditController.cleanOldLogs
);

export default router;
