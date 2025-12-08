import { Router } from "express";
import { recurringVisitController } from "../controllers/recurringVisitController";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";
import { createLimiter, readLimiter } from "../middlewares/rateLimitMiddleware";
import { auditMiddleware } from "../middlewares/auditMiddleware";
import { AuditAction } from "../interfaces/IAuditLog";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear visita recurrente (residentes y admin)
router.post(
  "/recurring-visits",
  roleMiddleware(["residente", "admin"]),
  createLimiter,
  auditMiddleware(AuditAction.VISIT_AUTHORIZE, "recurring-visit"),
  recurringVisitController.create
);

// Obtener mis visitas recurrentes (residente)
router.get(
  "/recurring-visits/my",
  roleMiddleware(["residente"]),
  readLimiter,
  recurringVisitController.getMyRecurring
);

// Obtener todas las activas (admin)
router.get(
  "/recurring-visits/active",
  roleMiddleware(["admin", "guardia"]),
  readLimiter,
  recurringVisitController.getAllActive
);

// Obtener por residente (admin)
router.get(
  "/recurring-visits/resident/:residentId",
  roleMiddleware(["admin"]),
  readLimiter,
  recurringVisitController.getByResident
);

// Actualizar visita recurrente
router.put(
  "/recurring-visits/:id",
  roleMiddleware(["residente", "admin"]),
  auditMiddleware(AuditAction.VISIT_UPDATE, "recurring-visit"),
  recurringVisitController.update
);

// Desactivar visita recurrente
router.delete(
  "/recurring-visits/:id",
  roleMiddleware(["residente", "admin"]),
  auditMiddleware(AuditAction.VISIT_DELETE, "recurring-visit"),
  recurringVisitController.deactivate
);

// Generar visitas ahora (admin - forzar generación)
router.post(
  "/recurring-visits/generate",
  roleMiddleware(["admin"]),
  recurringVisitController.generateNow
);

// Estadísticas (admin)
router.get(
  "/recurring-visits/stats",
  roleMiddleware(["admin"]),
  readLimiter,
  recurringVisitController.getStats
);

export default router;
