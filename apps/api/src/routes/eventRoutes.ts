import { Router } from "express";
import {
  getCommunityEvents,
  rsvpEvent,
  cancelRsvp,
} from "../controllers/eventController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// # Rutas de eventos comunitarios

// Obtener todos los eventos
router.get("/events", authMiddleware, getCommunityEvents);

// Registrarse en evento (RSVP)
router.post("/events/:eventId/rsvp", authMiddleware, rsvpEvent);

// Cancelar registro
router.delete("/events/:eventId/rsvp/:userId", authMiddleware, cancelRsvp);

export default router;
