import mongoose, { Schema, Model } from 'mongoose';
import { IRole } from '../interfaces/IRole';

const roleSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del rol es requerido'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'El slug es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción es requerida'],
      trim: true,
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: '#6B7280',
      validate: {
        validator: (v: string) => /^#[0-9A-F]{6}$/i.test(v),
        message: 'El color debe estar en formato hexadecimal (ej: #FF5733)',
      },
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

// Método para verificar si un rol tiene un permiso específico
roleSchema.methods.hasPermission = function (resource: string, action: string): boolean {
  return this.permissions.some(
    (permission: any) =>
      permission.resource === resource &&
      (permission.action === action || permission.action === 'manage')
  );
};

export const Role: Model<IRole> = mongoose.model<IRole>('Role', roleSchema);
export default Role;
