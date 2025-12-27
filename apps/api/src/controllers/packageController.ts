import { Request, Response } from "express";
import Package from "../models/Package";
import User from "../models/User";

// Registrar paquete
export const registerPackage = async (req: Request, res: Response) => {
  try {
    const { residentId, courier, trackingNumber, description, size, photo, notes } = req.body;
    const { user } = req as any;

    const resident = await User.findById(residentId);
    if (!resident) {
      return res.status(404).json({ error: "Residente no encontrado" });
    }

    const pkg = new Package({
      residentId,
      residentName: resident.name,
      apartment: resident.apartment || "N/A",
      courier,
      trackingNumber,
      description,
      size: size || "medium",
      receivedBy: user.name,
      photo,
      notes,
    });

    await pkg.save();

    // TODO: Enviar notificación push al residente

    res.status(201).json(pkg);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar paquete" });
  }
};

// Obtener paquetes del residente
export const getResidentPackages = async (req: Request, res: Response) => {
  try {
    const { residentId } = req.params;
    const packages = await Package.find({ residentId }).sort({ receivedDate: -1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener paquetes" });
  }
};

// Marcar paquete como recogido
export const pickupPackage = async (req: Request, res: Response) => {
  try {
    const { packageId } = req.params;
    const { signature } = req.body;
    const { user } = req as any;

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ error: "Paquete no encontrado" });
    }

    if (pkg.status === "picked_up") {
      return res.status(400).json({ error: "Paquete ya recogido" });
    }

    pkg.status = "picked_up";
    pkg.pickedUpBy = user.name;
    pkg.pickedUpDate = new Date();
    pkg.signature = signature;

    await pkg.save();
    res.json(pkg);
  } catch (error) {
    res.status(500).json({ error: "Error al marcar paquete" });
  }
};

// Obtener paquetes pendientes
export const getPendingPackages = async (req: Request, res: Response) => {
  try {
    const packages = await Package.find({ status: "pending" }).sort({ receivedDate: -1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener paquetes" });
  }
};
