import { Document, Types } from "mongoose";

export enum ParkingType {
  RESIDENT = "resident",
  VISITOR = "visitor",
}

export enum ParkingStatus {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
  RESERVED = "reserved",
  MAINTENANCE = "maintenance",
}

export interface IParkingSpaceInput {
  number: string; // Número del espacio (ej: "V-001", "R-045")
  type: ParkingType;
  status: ParkingStatus;
  floor?: string; // Piso/Nivel
  section?: string; // Sección (A, B, C, etc.)
  resident?: Types.ObjectId; // Si es de residente, asignado a quién
  notes?: string;
}

export interface IParkingSpace extends IParkingSpaceInput, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParkingAssignmentInput {
  parkingSpace: Types.ObjectId;
  visit?: Types.ObjectId; // Visita asociada
  vehiclePlate: string;
  entryTime: Date;
  exitTime?: Date;
  assignedBy: Types.ObjectId; // Guardia que asignó
  notes?: string;
}

export interface IParkingAssignment extends IParkingAssignmentInput, Document {
  _id: Types.ObjectId;
  duration?: number; // Duración en minutos (calculado)
  createdAt: Date;
  updatedAt: Date;
}
