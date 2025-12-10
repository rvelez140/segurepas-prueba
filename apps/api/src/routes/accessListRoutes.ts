import { Router } from 'express';
import { accessListController } from '../controllers/accessListController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { createLimiter, readLimiter } from '../middlewares/rateLimitMiddleware';
import { auditMiddleware } from '../middlewares/auditMiddleware';
import { AuditAction } from '../interfaces/IAuditLog';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// === BLACKLIST ===

// Agregar a lista negra (solo admin y guardias)
router.post(
  '/access-list/blacklist',
  roleMiddleware(['admin', 'guardia']),
  createLimiter,
  auditMiddleware(AuditAction.VISIT_UPDATE, 'blacklist'),
  accessListController.addToBlacklist
);

// Remover de lista negra (solo admin)
router.delete(
  '/access-list/blacklist/:document',
  roleMiddleware(['admin']),
  auditMiddleware(AuditAction.VISIT_UPDATE, 'blacklist'),
  accessListController.removeFromBlacklist
);

// Obtener lista negra
router.get(
  '/access-list/blacklist',
  roleMiddleware(['admin', 'guardia']),
  readLimiter,
  accessListController.getBlacklist
);

// Verificar si está en blacklist
router.get(
  '/access-list/blacklist/check/:document',
  roleMiddleware(['admin', 'guardia']),
  readLimiter,
  accessListController.checkBlacklist
);

// === WHITELIST ===

// Agregar a lista blanca (admin y residentes)
router.post(
  '/access-list/whitelist',
  roleMiddleware(['admin', 'residente']),
  createLimiter,
  auditMiddleware(AuditAction.VISIT_UPDATE, 'whitelist'),
  accessListController.addToWhitelist
);

// Remover de lista blanca
router.delete(
  '/access-list/whitelist/:document',
  roleMiddleware(['admin', 'residente']),
  auditMiddleware(AuditAction.VISIT_UPDATE, 'whitelist'),
  accessListController.removeFromWhitelist
);

// Obtener lista blanca
router.get('/access-list/whitelist', readLimiter, accessListController.getWhitelist);

// Verificar si está en whitelist
router.get(
  '/access-list/whitelist/check/:document',
  readLimiter,
  accessListController.checkWhitelist
);

// === GENERAL ===

// Estadísticas (solo admin)
router.get(
  '/access-list/stats',
  roleMiddleware(['admin']),
  readLimiter,
  accessListController.getStats
);

// Limpiar expiradas (solo admin)
router.post(
  '/access-list/clean-expired',
  roleMiddleware(['admin']),
  accessListController.cleanExpired
);

export default router;
