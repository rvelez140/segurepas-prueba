import mongoose, { Schema, Model } from 'mongoose';
import { INotification, NotificationType } from '../interfaces/INotification';

const notificationSchema: Schema = new mongoose.Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El destinatario es obligatorio'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: [true, 'El tipo de notificación es obligatorio'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: [200, 'El título no puede exceder 200 caracteres'],
    },
    message: {
      type: String,
      required: [true, 'El mensaje es obligatorio'],
      trim: true,
      maxlength: [1000, 'El mensaje no puede exceder 1000 caracteres'],
    },
    relatedVisit: {
      type: Schema.Types.ObjectId,
      ref: 'Visit',
      index: true,
    },
    relatedUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
  }
);

// Índices compuestos para consultas eficientes
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });

export const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  notificationSchema
);
