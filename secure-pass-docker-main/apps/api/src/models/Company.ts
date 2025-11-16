import mongoose, { Schema, Model } from "mongoose";
import { ICompany } from "../interfaces/ICompany";

const companySchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la empresa es requerido"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },
    subdomain: {
      type: String,
      required: [true, "El subdominio es requerido"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      validate: {
        validator: (v: string) => /^[a-z0-9-]+$/.test(v),
        message: "El subdominio solo puede contener letras minúsculas, números y guiones",
      },
    },
    logo: {
      type: String,
      validate: {
        validator: (v: string) =>
          !v || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v),
        message: "URL del logo no válida",
      },
    },
    settings: {
      primaryColor: {
        type: String,
        default: "#3b82f6",
        validate: {
          validator: (v: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v),
          message: "Color primario debe ser un código hexadecimal válido",
        },
      },
      secondaryColor: {
        type: String,
        default: "#1e40af",
        validate: {
          validator: (v: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v),
          message: "Color secundario debe ser un código hexadecimal válido",
        },
      },
      allowedDomains: {
        type: [String],
        default: [],
      },
    },
    contact: {
      email: {
        type: String,
        required: [true, "El email de contacto es requerido"],
        match: [/^\S+@\S+\.\S+$/, "Email inválido"],
      },
      phone: {
        type: String,
        validate: {
          validator: (v: string) =>
            !v || /^\+\d{1,3}[-\s]?\d{1,4}([-\s]?\d+)*$/.test(v),
          message: "Número de teléfono inválido",
        },
      },
      address: {
        type: String,
        maxlength: [200, "La dirección no puede exceder 200 caracteres"],
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium", "enterprise"],
        default: "free",
      },
      maxUsers: {
        type: Number,
        default: 10,
        min: [1, "Debe permitir al menos 1 usuario"],
      },
      maxResidents: {
        type: Number,
        default: 50,
        min: [1, "Debe permitir al menos 1 residente"],
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
      },
      isActive: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
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

// Índice compuesto para búsquedas eficientes
companySchema.index({ subdomain: 1, "subscription.isActive": 1 });

export const Company: Model<ICompany> = mongoose.model<ICompany>(
  "Company",
  companySchema
);
export default Company;
