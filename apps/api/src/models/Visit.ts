import mongoose, { Schema, Model, Types } from 'mongoose';
import { IVisit, VisitState } from '../interfaces/IVisit';

const visitSchema: Schema = new mongoose.Schema(
  {
    // Información de la visita
    visit: {
      name: {
        type: String,
        required: [true, 'El nombre del visitante es obligatorio'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
      },
      email: {
        type: String,
        required: [true, 'El email es requerido'],
        match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
      },
      document: {
        type: String,
        required: [true, 'El documento de identidad es obligatorio'],
        index: true,
        validate: {
          validator: (v: string) => v && v.length == 11,
          message: 'El documento debe tener 11 caracteres',
        },
      },
      visitImage: {
        type: String,
        validate: {
          validator: (v: string) => !v || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v),
          message: 'URL de imagen no válida',
        },
      },
      vehicleImage: {
        type: String,
        validate: {
          validator: (v: string) => !v || /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/.test(v),
          message: 'URL de imagen de vehículo no válida',
        },
      },
      vehiclePlate: {
        type: String,
        trim: true,
        uppercase: true,
        maxlength: [10, 'La placa no puede exceder 10 caracteres'],
        validate: {
          validator: (v: string) => !v || /^[A-Z]{3}\d{3}$/.test(v.replace(/\s+/g, '')),
          message: 'Formato de placa inválido (debe ser ABC123)',
        },
      },
    },

    // Información de la autorización
    authorization: {
      resident: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'El residente autorizante es obligatorio'],
      },
      state: {
        type: String,
        enum: Object.values(VisitState),
        default: VisitState.PENDING,
      },
      date: {
        type: Date,
        default: Date.now,
      },
      exp: {
        type: Date,
        required: [true, 'La fecha de expiración es obligatoria'],
        validate: {
          validator: function (this: IVisit, v: Date) {
            return v > new Date();
          },
          message: 'La fecha de expiración debe ser futura',
        },
      },
      reason: {
        type: String,
        maxlength: [500, 'La razón no puede exceder 500 caracteres'],
      },
    },

    registry: {
      // Información de registro de entrada
      entry: {
        guard: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          validate: {
            validator: function (this: IVisit, v: Types.ObjectId) {
              return !v || this.authorization.state !== VisitState.PENDING;
            },
            message: 'Solo guardias pueden registrar entradas',
          },
        },
        date: {
          type: Date,
          validate: {
            validator: function (this: IVisit, v: Date) {
              return !v || (this.registry?.entry?.guard && v <= new Date());
            },
            message: 'Fecha de entrada inválida',
          },
        },
        note: {
          type: String,
          maxlength: [200, 'La nota no puede exceder 200 caracteres'],
        },
      },

      // Información de registro de salida
      exit: {
        guard: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          validate: {
            validator: function (this: IVisit, v: Types.ObjectId) {
              return (
                !v ||
                (this.registry?.entry?.guard && this.authorization.state === VisitState.APPROVED)
              );
            },
            message: 'Debe existir una entrada antes de registrar salida',
          },
        },
        date: {
          type: Date,
          validate: {
            validator: function (this: IVisit, v: Date) {
              if (!v) return true;
              const entryDate = this.registry?.entry?.date;
              return !!this.registry?.exit?.guard && entryDate && v >= entryDate;
            },
            message: 'La salida debe ser posterior a la entrada',
          },
        },
        note: {
          type: String,
          maxlength: [200, 'La nota no puede exceder 200 caracteres'],
        },
      },
    },

    // QR ID generado al crear la visita (autorización)
    qrId: {
      type: String,
      required: true,
      unique: true,
      index: true,
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
        delete ret.__v;
      },
    },
  }
);

// Middleware para actualizar estado cuando expira
visitSchema.pre<IVisit>('save', function (next) {
  if (this.authorization.exp < new Date() && this.authorization.state === VisitState.PENDING) {
    this.authorization.state = VisitState.EXPIRED;
  }
  next();
});

export const Visit: Model<IVisit> = mongoose.model<IVisit>('Visit', visitSchema);
export default Visit;
