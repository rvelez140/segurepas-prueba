import mongoose, { Schema, Model } from 'mongoose';
import { IPermission, PermissionResource, PermissionAction } from '../interfaces/IPermission';

const permissionSchema: Schema = new mongoose.Schema(
  {
    resource: {
      type: String,
      enum: Object.values(PermissionResource),
      required: [true, 'El recurso es requerido'],
    },
    action: {
      type: String,
      enum: Object.values(PermissionAction),
      required: [true, 'La acción es requerida'],
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

// Índice compuesto para evitar permisos duplicados
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

export const Permission: Model<IPermission> = mongoose.model<IPermission>('Permission', permissionSchema);
export default Permission;
