import { Document, Types } from "mongoose";

export enum ListType {
  BLACKLIST = "blacklist", // Lista negra - bloquear
  WHITELIST = "whitelist", // Lista blanca - acceso rápido
}

export enum AccessStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface IAccessListInput {
  document: string; // Cédula del visitante
  type: ListType;
  status: AccessStatus;
  reason?: string; // Razón para incluir en la lista
  addedBy: Types.ObjectId; // Usuario que agregó a la lista
  expiresAt?: Date; // Opcional: fecha de expiración
  notes?: string;
}

export interface IAccessList extends IAccessListInput, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
