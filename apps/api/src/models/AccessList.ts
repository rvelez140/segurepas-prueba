import mongoose, { Schema, Model } from "mongoose";
import { IAccessList, ListType, AccessStatus } from "../interfaces/IAccessList";

const accessListSchema = new mongoose.Schema<IAccessList>(
  {
    document: {
      type: String,
      required: true,
      index: true,
      validate: {
        validator: (v: string) => v && v.length >= 8 && v.length <= 11,
        message: "El documento debe tener entre 8 y 11 caracteres",
      },
    },
    type: {
      type: String,
      enum: Object.values(ListType),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AccessStatus),
      default: AccessStatus.ACTIVE,
      index: true,
    },
    reason: {
      type: String,
      maxlength: [500, "La razón no puede exceder 500 caracteres"],
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
    notes: {
      type: String,
      maxlength: [1000, "Las notas no pueden exceder 1000 caracteres"],
    },
  },
  {
    timestamps: true,
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

// Índice compuesto para búsquedas rápidas
accessListSchema.index({ document: 1, type: 1, status: 1 });

// Índice único para evitar duplicados
accessListSchema.index({ document: 1, type: 1 }, { unique: true });

// TTL Index para expiración automática
accessListSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AccessList: Model<IAccessList> = mongoose.model<IAccessList>(
  "AccessList",
  accessListSchema
);

export default AccessList;
