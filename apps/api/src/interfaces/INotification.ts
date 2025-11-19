import { Document, Types } from 'mongoose';

export enum NotificationType {
  VISITOR_ENTRY = 'entrada_visitante',
  VISITOR_EXIT = 'salida_visitante',
  VISIT_AUTHORIZED = 'visita_autorizada',
  SUBSCRIPTION = 'suscripcion',
  PAYMENT = 'pago',
  SYSTEM = 'sistema',
}

export interface INotificationInput {
  recipient: Types.ObjectId; // Usuario que recibe la notificación
  type: NotificationType; // Tipo de notificación
  title: string; // Título de la notificación
  message: string; // Mensaje de la notificación
  relatedVisit?: Types.ObjectId; // Visita relacionada (opcional)
  relatedUser?: Types.ObjectId; // Usuario relacionado (opcional)
  metadata?: Record<string, any>; // Datos adicionales personalizados
  isRead: boolean; // Si la notificación ha sido leída
  readAt?: Date; // Fecha en que se leyó
}

export interface INotification extends INotificationInput, Document {
  _id: Types.ObjectId; // Id de la notificación
  createdAt: Date; // Fecha de creación
  updatedAt: Date; // Fecha de última actualización
}
