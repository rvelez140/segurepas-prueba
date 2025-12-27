import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, GuardShift } from '../interfaces/IUser';

const userSchema: Schema = new mongoose.Schema(
  {
    auth: {
      email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
        index: true,
      },
      password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
        select: false,
      },
      twoFactorSecret: {
        type: String,
        select: false,
        default: null,
      },
      twoFactorEnabled: {
        type: Boolean,
        default: false,
      },
      twoFactorBackupCodes: {
        type: [String],
        select: false,
        default: [],
      },
    },
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
    },
    registerDate: {
      type: Date,
      default: Date.now,
    },
    updateDate: {
      type: Date,
      default: Date.now,
    },

    role: {
      type: String,
      enum: ['residente', 'guardia', 'admin'],
      required: [true, 'El rol es requerido'],
    },

    // Campos específicos de residente
    apartment: {
      type: String,
      required: function (this: { role: string }) {
        return this.role === 'residente';
      },
      validate: {
        validator: (v: string) => /^[A-Za-z]-\d{1,3}$/.test(v),
        message: "Formato de Apartamento no válido (Ejemplo: 'A-1' )",
      },
    },
    tel: {
      type: String,
      required: function (this: { role: string }) {
        return this.role === 'residente';
      },
      validate: {
        validator: (v: string) => /^\+\d{1,3}[-\s]?\d{1,4}([-\s]?\d+)*$/.test(v),
        message: "Número de teléfono inválido (Ejemplo: '+1809-000-0000') ",
      },
    },
    document: {
      type: String,
      required: function (this: { role: string }) {
        return this.role === 'residente';
      },
      validate: {
        validator: (v: string) => /^\d{11}$/.test(v),
        message: 'El documento de identidad debe tener 11 dígitos',
      },
    },
    vehiclePlate: {
      type: String,
      required: function (this: { role: string }) {
        return this.role === 'residente';
      },
      trim: true,
      uppercase: true,
    },
    documentImage: {
      type: String,
      required: false,
    },
    vehiclePlateImage: {
      type: String,
      required: false,
    },
    // Campos específicos de guardia
    shift: {
      type: String,
      enum: Object.values(GuardShift),
      required: function (this: { role: string }) {
        return this.role === 'guardia';
      },
    },
    // Campos específicos de admin
    lastAccess: {
      type: Date,
      required: function (this: { role: string }) {
        return this.role === 'admin';
      },
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.auth;
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Middleware para hashear la contraseña antes de guardar
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('auth.password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.auth.password = await bcrypt.hash(this.auth.password, salt);
    this.updateDate = new Date();
    next();
  } catch (err: any) {
    next(err);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.auth.password);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
