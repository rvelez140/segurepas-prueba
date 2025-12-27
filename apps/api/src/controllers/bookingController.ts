import { Request, Response } from "express";
import Booking from "../models/Booking";
import CommonSpace from "../models/CommonSpace";

// Obtener todos los espacios comunes
export const getCommonSpaces = async (req: Request, res: Response) => {
  try {
    const spaces = await CommonSpace.find({ isActive: true });
    res.json(spaces);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener espacios comunes" });
  }
};

// Obtener disponibilidad de un espacio
export const getSpaceAvailability = async (req: Request, res: Response) => {
  try {
    const { spaceId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Fecha requerida" });
    }

    const bookings = await Booking.find({
      spaceId,
      date: new Date(date as string),
      status: { $in: ["pending", "confirmed"] },
    });

    const bookedSlots = bookings.map(
      (b) => `${b.startTime}-${b.endTime}`
    );

    res.json({
      available: true,
      bookedSlots,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al verificar disponibilidad" });
  }
};

// Crear reserva
export const createBooking = async (req: Request, res: Response) => {
  try {
    const { userId, spaceId, date, startTime, endTime, attendees, notes } = req.body;

    const space = await CommonSpace.findById(spaceId);
    if (!space) {
      return res.status(404).json({ error: "Espacio no encontrado" });
    }

    // Verificar disponibilidad
    const conflictingBooking = await Booking.findOne({
      spaceId,
      date: new Date(date),
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime },
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime },
        },
      ],
    });

    if (conflictingBooking) {
      return res.status(400).json({ error: "Horario no disponible" });
    }

    // Calcular costo
    const start = parseInt(startTime.split(":")[0]);
    const end = parseInt(endTime.split(":")[0]);
    const hours = end - start;
    const totalAmount = hours * space.pricePerHour;

    const booking = new Booking({
      userId,
      spaceId,
      spaceName: space.name,
      date: new Date(date),
      startTime,
      endTime,
      status: "confirmed",
      totalAmount,
      attendees,
      notes,
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: "Error al crear reserva" });
  }
};

// Obtener reservas del usuario
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId }).sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener reservas" });
  }
};

// Cancelar reserva
export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    if (booking.status === "canceled") {
      return res.status(400).json({ error: "Reserva ya cancelada" });
    }

    booking.status = "canceled";
    await booking.save();

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Error al cancelar reserva" });
  }
};
