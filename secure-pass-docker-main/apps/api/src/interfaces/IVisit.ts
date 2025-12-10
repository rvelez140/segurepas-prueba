import { Document, Types } from 'mongoose';

export enum VisitState {
  PENDING = 'pendiente', // Estado inicial de la visita si la registra un residente
  APPROVED = 'aprobada', // Estado de la visita al ser registrda su entrada por guardia
  DENIED = 'rechazada', // Estado de la visita al ser denegada su entrada
  COMPLETE = 'finalizada', // Estado de la visita al ser registrada su salida por guardia
  EXPIRED = 'expirada', // Estado de la visita cuando llega su fecha de expiración y sigue pendiente
}

export interface IVisitInput {
  company: Types.ObjectId; // Id de la empresa a la que pertenece la visita
  visit: {
    name: string; // Nombre del visitante
    email: string; // Dirección email del visitante
    document: string; // Cédula o pasaporte de la visita
    visitImage?: string; // Url de imagen de la visita
    vehicleImage?: string; // Url de imagen del vehículo de la visita
  };
  authorization: {
    resident: Types.ObjectId; // Id del residente autorizante
    state: VisitState; // Estado actual de la visita
    date: Date; // Fecha en que se creó la visita
    exp: Date; // Fecha de expiración de la autorización
    reason?: string; // Razón de autorización
  };
  registry?: {
    entry?: {
      guard: Types.ObjectId; // Id del guardia que registro su entrada
      date: Date; // Fecha de registro de entrada
      note?: string; // Nota por parte del guardia
    };
    exit?: {
      guard: Types.ObjectId; // Id del guardia que registro su salida
      date: Date; // Fecha de registro de salida
      note?: string; // Nota por parte del guardia
    };
  };
  qrId?: string; // QR ID generado al autorizar visita
}

export interface IVisit extends IVisitInput, Document {
  _id: Types.ObjectId; // Id de la visita
}
