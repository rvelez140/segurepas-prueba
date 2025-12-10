import mongoose, { Schema, Model } from 'mongoose';
import { IAuditLog, AuditAction, AuditSeverity } from '../interfaces/IAuditLog';

const auditLogSchema: Schema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: Object.values(AuditSeverity),
      required: true,
      default: AuditSeverity.INFO,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userEmail: {
      type: String,
      index: true,
    },
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: {
      type: String,
    },
    resource: {
      type: String,
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    success: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    errorMessage: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Usamos nuestro propio timestamp
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Índices compuestos para consultas frecuentes
auditLogSchema.index({ timestamp: -1, action: 1 });
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ severity: 1, timestamp: -1 });
auditLogSchema.index({ success: 1, timestamp: -1 });

// TTL Index - Eliminar logs antiguos automáticamente después de 90 días
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 días

export const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
