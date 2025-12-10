import { Router } from 'express';
import { parkingController } from '../controllers/parkingController';
import { authMiddleware, roleMiddleware } from '../middlewares/authMiddleware';
import { createLimiter, readLimiter } from '../middlewares/rateLimitMiddleware';
import { auditMiddleware } from '../middlewares/auditMiddleware';
import { AuditAction } from '../interfaces/IAuditLog';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// === ESPACIOS DE PARQUEO ===

// Crear espacio (solo admin)
router.post(
  '/parking/spaces',
  roleMiddleware(['admin']),
  createLimiter,
  auditMiddleware(AuditAction.SYSTEM_UPDATE, 'parking-space'),
  parkingController.createSpace
);

// Obtener todos los espacios
router.get(
  '/parking/spaces',
  roleMiddleware(['admin', 'guardia']),
  readLimiter,
  parkingController.getAllSpaces
);

// Obtener espacios disponibles
router.get(
  '/parking/spaces/available',
  roleMiddleware(['admin', 'guardia']),
  readLimiter,
  parkingController.getAvailableSpaces
);

// Obtener espacio por ID
router.get(
  '/parking/spaces/:id',
  roleMiddleware(['admin', 'guardia']),
  readLimiter,
  parkingController.getSpaceById
);

// Actualizar espacio (solo admin)
router.put(
  '/parking/spaces/:id',
  roleMiddleware(['admin']),
  auditMiddleware(AuditAction.SYSTEM_UPDATE, 'parking-space'),
  parkingController.updateSpace
);

// Eliminar espacio (solo admin)
router.delete(
  '/parking/spaces/:id',
  roleMiddleware(['admin']),
  auditMiddleware(AuditAction.SYSTEM_UPDATE, 'parking-space'),
  parkingController.deleteSpace
);

// === ASIGNACIONES ===

// Asignar espacio (guardia y admin)
router.post(
  '/parking/assign',
  roleMiddleware(['admin', 'guardia']),
  createLimiter,
  auditMiddleware(AuditAction.VISIT_UPDATE, 'parking-assignment'),
  parkingController.assignSpace
);

// Registrar salida (guardia y admin)
router.put(
  '/parking/exit/:assignmentId',
  roleMiddleware(['admin', 'guardia']),
  auditMiddleware(AuditAction.VISIT_UPDATE, 'parking-exit'),
  parkingController.recordExit
);

// Obtener historial de asignaciones
router.get(
  '/parking/assignments/history',
  roleMiddleware(['admin', 'guardia']),
  readLimiter,
  parkingController.getAssignmentHistory
);

// Obtener asignaciones activas
router.get(
  '/parking/assignments/active',
  roleMiddleware(['admin', 'guardia']),
  readLimiter,
  parkingController.getActiveAssignments
);

// === ESTADÍSTICAS ===

// Estadísticas de parqueadero (admin)
router.get('/parking/stats', roleMiddleware(['admin']), readLimiter, parkingController.getStats);

export default router;
