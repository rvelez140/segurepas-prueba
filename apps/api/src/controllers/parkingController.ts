import { Request, Response } from "express";
import Vehicle from "../models/Vehicle";
import ParkingEntry from "../models/ParkingEntry";

// Registrar vehículo
export const registerVehicle = async (req: Request, res: Response) => {
  try {
    const { residentId, licensePlate, brand, model, color, type, parkingSpot } = req.body;

    const existingVehicle = await Vehicle.findOne({ licensePlate });
    if (existingVehicle) {
      return res.status(400).json({ error: "Vehículo ya registrado" });
    }

    const vehicle = new Vehicle({
      residentId,
      licensePlate: licensePlate.toUpperCase(),
      brand,
      model,
      color,
      type,
      parkingSpot,
    });

    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar vehículo" });
  }
};

// Obtener vehículos del residente
export const getResidentVehicles = async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    const vehicles = await Vehicle.find({ residentId, isActive: true });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener vehículos" });
  }
};

// Actualizar vehículo
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const updates = req.body;

    const vehicle = await Vehicle.findByIdAndUpdate(vehicleId, updates, { new: true });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar vehículo" });
  }
};

// Desactivar vehículo
export const deactivateVehicle = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;

    const vehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      { isActive: false },
      { new: true }
    );

    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ error: "Error al desactivar vehículo" });
  }
};

// Registrar entrada de vehículo
export const registerParkingEntry = async (req: Request, res: Response) => {
  try {
    const { licensePlate, parkingSpot, photo } = req.body;
    const { user } = req as any;

    const vehicle = await Vehicle.findOne({ licensePlate: licensePlate.toUpperCase() });
    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no registrado" });
    }

    // Verificar si ya hay una entrada activa
    const activeEntry = await ParkingEntry.findOne({
      licensePlate: licensePlate.toUpperCase(),
      exitTime: null,
    });

    if (activeEntry) {
      return res.status(400).json({ error: "El vehículo ya tiene una entrada activa" });
    }

    const entry = new ParkingEntry({
      vehicleId: vehicle._id,
      licensePlate: licensePlate.toUpperCase(),
      guardId: user.id,
      parkingSpot,
      photo,
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar entrada" });
  }
};

// Registrar salida de vehículo
export const registerParkingExit = async (req: Request, res: Response) => {
  try {
    const { entryId } = req.params;

    const entry = await ParkingEntry.findById(entryId);
    if (!entry) {
      return res.status(404).json({ error: "Entrada no encontrada" });
    }

    if (entry.exitTime) {
      return res.status(400).json({ error: "La salida ya fue registrada" });
    }

    entry.exitTime = new Date();
    await entry.save();

    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar salida" });
  }
};

// Obtener entradas activas (vehículos en estacionamiento)
export const getActiveEntries = async (req: Request, res: Response) => {
  try {
    const entries = await ParkingEntry.find({ exitTime: null })
      .populate("vehicleId")
      .sort({ entryTime: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener entradas" });
  }
};

// Obtener historial de estacionamiento
export const getParkingHistory = async (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const entries = await ParkingEntry.find({ vehicleId }).sort({ entryTime: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener historial" });
  }
};
