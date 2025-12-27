import { Router } from "express";
import {
  getCommonSpaces,
  getSpaceAvailability,
  createBooking,
  getUserBookings,
  cancelBooking,
} from "../controllers/bookingController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// # Rutas de reservas de espacios comunes

// Obtener todos los espacios comunes
router.get("/spaces", authMiddleware, getCommonSpaces);

// Obtener disponibilidad de un espacio
router.get("/spaces/:spaceId/availability", authMiddleware, getSpaceAvailability);

// Crear reserva
router.post("/bookings", authMiddleware, createBooking);

// Obtener reservas del usuario
router.get("/bookings/user/:userId", authMiddleware, getUserBookings);

// Cancelar reserva
router.patch("/bookings/:bookingId/cancel", authMiddleware, cancelBooking);

export default router;
