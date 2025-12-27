import { Router } from "express";
import {
  registerPackage,
  getResidentPackages,
  pickupPackage,
  getPendingPackages,
} from "../controllers/packageController";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// # Rutas de gestión de paquetes

// Registrar paquete (solo guardia/admin)
router.post(
  "/packages",
  authMiddleware,
  roleMiddleware(["guardia", "admin"]),
  registerPackage
);

// Obtener paquetes del residente
router.get("/packages/resident/:residentId", authMiddleware, getResidentPackages);

// Marcar paquete como recogido
router.patch("/packages/:packageId/pickup", authMiddleware, pickupPackage);

// Obtener paquetes pendientes (solo guardia/admin)
router.get(
  "/packages/pending",
  authMiddleware,
  roleMiddleware(["guardia", "admin"]),
  getPendingPackages
);

export default router;
