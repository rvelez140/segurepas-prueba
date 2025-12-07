import { Router } from "express";
import { subscriptionController } from "../controllers/subscriptionController";
import {
  authMiddleware,
  roleMiddleware,
} from "../middlewares/authMiddleware";

const router = Router();

// Rutas públicas
router.get("/plans", subscriptionController.getAllPlansDetails);
router.get("/plans/:planType", subscriptionController.getPlanDetails);

// Rutas protegidas - requieren autenticación
router.use(authMiddleware);

// Crear nueva suscripción
router.post("/", subscriptionController.createSubscription);

// Obtener suscripciones
router.get("/", subscriptionController.getAllSubscriptions);
router.get("/active", subscriptionController.getActiveSubscriptions);
router.get("/:id", subscriptionController.getSubscription);

// Actualizar suscripción
router.put("/:id", subscriptionController.updateSubscription);

// Gestión de plan
router.post("/:id/upgrade", subscriptionController.upgradePlan);
router.post("/:id/activate", subscriptionController.activateSubscription);
router.post("/:id/cancel", subscriptionController.cancelSubscription);
router.post("/:id/suspend", subscriptionController.suspendSubscription);

// Gestión de uso
router.put("/:id/usage", subscriptionController.updateUsage);
router.get("/:id/limits", subscriptionController.checkLimits);

// Eliminar suscripción (solo admin)
router.delete("/:id", subscriptionController.deleteSubscription);

export default router;
