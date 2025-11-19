import { ParkingSpace } from "../models/ParkingSpace";
import { ParkingAssignment } from "../models/ParkingAssignment";
import {
  IParkingSpace,
  IParkingAssignment,
  ParkingType,
  ParkingStatus,
} from "../interfaces/IParking";
import { Types } from "mongoose";

export class ParkingService {
  // === PARKING SPACES ===

  /**
   * Crear espacio de parqueo
   */
  static async createSpace(data: any): Promise<IParkingSpace> {
    return await ParkingSpace.create(data);
  }

  /**
   * Obtener todos los espacios
   */
  static async getAllSpaces(filters?: {
    type?: ParkingType;
    status?: ParkingStatus;
    floor?: string;
  }): Promise<IParkingSpace[]> {
    const query: any = {};
    if (filters?.type) query.type = filters.type;
    if (filters?.status) query.status = filters.status;
    if (filters?.floor) query.floor = filters.floor;

    return await ParkingSpace.find(query)
      .populate("resident", "name apartment")
      .sort({ number: 1 });
  }

  /**
   * Obtener espacios disponibles
   */
  static async getAvailableSpaces(type?: ParkingType): Promise<IParkingSpace[]> {
    const query: any = { status: ParkingStatus.AVAILABLE };
    if (type) query.type = type;

    return await ParkingSpace.find(query).sort({ number: 1 });
  }

  /**
   * Actualizar espacio
   */
  static async updateSpace(
    id: Types.ObjectId,
    updates: Partial<IParkingSpace>
  ): Promise<IParkingSpace | null> {
    return await ParkingSpace.findByIdAndUpdate(id, { $set: updates }, { new: true });
  }

  /**
   * Cambiar estado de espacio
   */
  static async changeStatus(
    id: Types.ObjectId,
    status: ParkingStatus
  ): Promise<IParkingSpace | null> {
    return await ParkingSpace.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
  }

  // === PARKING ASSIGNMENTS ===

  /**
   * Asignar espacio de parqueo
   */
  static async assignSpace(data: {
    parkingSpaceId: Types.ObjectId;
    vehiclePlate: string;
    visitId?: Types.ObjectId;
    assignedBy: Types.ObjectId;
    notes?: string;
  }): Promise<IParkingAssignment> {
    // Verificar que el espacio esté disponible
    const space = await ParkingSpace.findById(data.parkingSpaceId);
    if (!space) {
      throw new Error("Espacio de parqueo no encontrado");
    }

    if (space.status !== ParkingStatus.AVAILABLE) {
      throw new Error("El espacio no está disponible");
    }

    // Crear asignación
    const assignment = await ParkingAssignment.create({
      parkingSpace: data.parkingSpaceId,
      visit: data.visitId,
      vehiclePlate: data.vehiclePlate,
      entryTime: new Date(),
      assignedBy: data.assignedBy,
      notes: data.notes,
    });

    // Marcar espacio como ocupado
    await ParkingSpace.findByIdAndUpdate(data.parkingSpaceId, {
      $set: { status: ParkingStatus.OCCUPIED },
    });

    return assignment.populate([
      { path: "parkingSpace" },
      { path: "visit" },
      { path: "assignedBy", select: "name role" },
    ]);
  }

  /**
   * Registrar salida de parqueo
   */
  static async recordExit(
    assignmentId: Types.ObjectId
  ): Promise<IParkingAssignment | null> {
    const assignment = await ParkingAssignment.findById(assignmentId);
    if (!assignment) {
      throw new Error("Asignación no encontrada");
    }

    if (assignment.exitTime) {
      throw new Error("La salida ya fue registrada");
    }

    assignment.exitTime = new Date();
    await assignment.save();

    // Liberar espacio
    await ParkingSpace.findByIdAndUpdate(assignment.parkingSpace, {
      $set: { status: ParkingStatus.AVAILABLE },
    });

    return assignment.populate([
      { path: "parkingSpace" },
      { path: "visit" },
      { path: "assignedBy", select: "name role" },
    ]);
  }

  /**
   * Obtener asignaciones activas
   */
  static async getActiveAssignments(): Promise<IParkingAssignment[]> {
    return await ParkingAssignment.find({ exitTime: { $exists: false } })
      .populate("parkingSpace")
      .populate("visit")
      .populate("assignedBy", "name role")
      .sort({ entryTime: -1 });
  }

  /**
   * Obtener historial de asignaciones
   */
  static async getAssignmentHistory(filters?: {
    startDate?: Date;
    endDate?: Date;
    vehiclePlate?: string;
  }): Promise<IParkingAssignment[]> {
    const query: any = {};

    if (filters?.startDate || filters?.endDate) {
      query.entryTime = {};
      if (filters.startDate) query.entryTime.$gte = filters.startDate;
      if (filters.endDate) query.entryTime.$lte = filters.endDate;
    }

    if (filters?.vehiclePlate) {
      query.vehiclePlate = filters.vehiclePlate.toUpperCase();
    }

    return await ParkingAssignment.find(query)
      .populate("parkingSpace")
      .populate("visit")
      .populate("assignedBy", "name role")
      .sort({ entryTime: -1 });
  }

  /**
   * Estadísticas de parqueo
   */
  static async getStats(): Promise<{
    totalSpaces: number;
    available: number;
    occupied: number;
    reserved: number;
    maintenance: number;
    activeAssignments: number;
    byType: {
      resident: { total: number; available: number };
      visitor: { total: number; available: number };
    };
  }> {
    const [
      totalSpaces,
      available,
      occupied,
      reserved,
      maintenance,
      activeAssignments,
      residentSpaces,
      visitorSpaces,
      residentAvailable,
      visitorAvailable,
    ] = await Promise.all([
      ParkingSpace.countDocuments(),
      ParkingSpace.countDocuments({ status: ParkingStatus.AVAILABLE }),
      ParkingSpace.countDocuments({ status: ParkingStatus.OCCUPIED }),
      ParkingSpace.countDocuments({ status: ParkingStatus.RESERVED }),
      ParkingSpace.countDocuments({ status: ParkingStatus.MAINTENANCE }),
      ParkingAssignment.countDocuments({ exitTime: { $exists: false } }),
      ParkingSpace.countDocuments({ type: ParkingType.RESIDENT }),
      ParkingSpace.countDocuments({ type: ParkingType.VISITOR }),
      ParkingSpace.countDocuments({
        type: ParkingType.RESIDENT,
        status: ParkingStatus.AVAILABLE,
      }),
      ParkingSpace.countDocuments({
        type: ParkingType.VISITOR,
        status: ParkingStatus.AVAILABLE,
      }),
    ]);

    return {
      totalSpaces,
      available,
      occupied,
      reserved,
      maintenance,
      activeAssignments,
      byType: {
        resident: {
          total: residentSpaces,
          available: residentAvailable,
        },
        visitor: {
          total: visitorSpaces,
          available: visitorAvailable,
        },
      },
    };
  }
}
