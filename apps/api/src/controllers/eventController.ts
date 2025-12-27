import { Request, Response } from "express";
import Event from "../models/Event";

// Obtener eventos comunitarios
export const getCommunityEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find({
      status: { $in: ["upcoming", "ongoing"] },
      date: { $gte: new Date() },
    }).sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener eventos" });
  }
};

// RSVP a evento
export const rsvpEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    // Verificar si ya está registrado
    if (event.attendees.includes(userId as any)) {
      return res.status(400).json({ error: "Ya está registrado en este evento" });
    }

    // Verificar capacidad máxima
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ error: "Evento lleno" });
    }

    event.attendees.push(userId as any);
    await event.save();

    // TODO: Enviar notificación de confirmación

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Error al registrarse en evento" });
  }
};

// Cancelar RSVP
export const cancelRsvp = async (req: Request, res: Response) => {
  try {
    const { eventId, userId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    event.attendees = event.attendees.filter(
      (id) => id.toString() !== userId
    );
    await event.save();

    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar registro" });
  }
};
