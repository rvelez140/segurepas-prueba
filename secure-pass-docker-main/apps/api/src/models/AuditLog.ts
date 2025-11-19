import mongoose, { Schema, Model } from "mongoose";
import { IAuditLog, AuditAction, AuditCategory, AuditSeverity } from "../interfaces/IAuditLog";

const auditLogSchema: Schema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: [true, "La acción es requerida"],
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(AuditCategory),
      required: [true, "La categoría es requerida"],
      index: true,
    },
    severity: {
      type: String,
      enum: Object.values(AuditSeverity),
      default: AuditSeverity.INFO,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    },
    actor: {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        index: true,
      },
      email: {
        type: String,
      },
      role: {
        type: String,
      },
      isImpersonating: {
        type: Boolean,
        default: false,
      },
      impersonatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
    resource: {
      type: {
        type: String,
      },
      id: {
        type: Schema.Types.ObjectId,
      },
      name: {
        type: String,
      },
    },
    changes: {
      before: {
        type: Schema.Types.Mixed,
      },
      after: {
        type: Schema.Types.Mixed,
      },
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    description: {
      type: String,
      required: [true, "La descripción es requerida"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Usamos timestamp custom
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Índices compuestos para búsquedas eficientes
auditLogSchema.index({ company: 1, timestamp: -1 });
auditLogSchema.index({ "actor.userId": 1, timestamp: -1 });
auditLogSchema.index({ category: 1, severity: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, company: 1, timestamp: -1 });

// TTL Index: Los logs se borran automáticamente después de 2 años (opcional)
// Descomentar si se desea auto-eliminación
// auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 años

export const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>(
  "AuditLog",
  auditLogSchema
);

export default AuditLog;
