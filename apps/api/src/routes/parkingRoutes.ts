import { Router } from "express";
import {
  registerVehicle,
  getResidentVehicles,
  updateVehicle,
  deactivateVehicle,
  registerParkingEntry,
  registerParkingExit,
  getActiveEntries,
  getParkingHistory,
} from "../controllers/parkingController";
import { authMiddleware, roleMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// # Rutas de gestión de vehículos y estacionamiento

// Registrar vehículo
router.post("/vehicles", authMiddleware, registerVehicle);

// Obtener vehículos del residente
router.get("/vehicles/resident/:residentId", authMiddleware, getResidentVehicles);

// Actualizar vehículo
router.patch("/vehicles/:vehicleId", authMiddleware, updateVehicle);

// Desactivar vehículo
router.delete("/vehicles/:vehicleId", authMiddleware, deactivateVehicle);

// Registrar entrada de vehículo (solo guardia/admin)
router.post(
  "/parking/entry",
  authMiddleware,
  roleMiddleware(["guardia", "admin"]),
  registerParkingEntry
);

// Registrar salida de vehículo (solo guardia/admin)
router.patch(
  "/parking/:entryId/exit",
  authMiddleware,
  roleMiddleware(["guardia", "admin"]),
  registerParkingExit
);

// Obtener entradas activas (solo guardia/admin)
router.get(
  "/parking/active",
  authMiddleware,
  roleMiddleware(["guardia", "admin"]),
  getActiveEntries
);

// Obtener historial de estacionamiento
router.get("/parking/history/:vehicleId", authMiddleware, getParkingHistory);

export default router;
