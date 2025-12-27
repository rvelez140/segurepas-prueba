import mongoose, { Document, Schema } from 'mongoose';

export interface IDevice extends Document {
  userId: mongoose.Types.ObjectId;
  deviceName: string;
  deviceType: 'web' | 'mobile' | 'desktop';
  deviceOS?: string;
  deviceBrowser?: string;
  deviceModel?: string;
  deviceIcon?: string;
  ipAddress?: string;
  userAgent?: string;
  lastActive: Date;
  createdAt: Date;
  isActive: boolean;
  token?: string; // Token JWT específico para este dispositivo
  refreshToken?: string; // Para renovación de sesión
  location?: {
    country?: string;
    city?: string;
    lat?: number;
    lon?: number;
  };
  trustScore?: number; // Nivel de confianza del dispositivo (0-100)
}

const DeviceSchema = new Schema<IDevice>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    deviceName: {
      type: String,
      required: true,
      default: function(this: IDevice) {
        // Generar nombre automático basado en el tipo
        const types: Record<string, string> = {
          web: 'Navegador Web',
          mobile: 'Dispositivo Móvil',
          desktop: 'Aplicación Desktop'
        };
        return types[this.deviceType] || 'Dispositivo Desconocido';
      }
    },
    deviceType: {
      type: String,
      enum: ['web', 'mobile', 'desktop'],
      required: true
    },
    deviceOS: {
      type: String,
      default: null
    },
    deviceBrowser: {
      type: String,
      default: null
    },
    deviceModel: {
      type: String,
      default: null
    },
    deviceIcon: {
      type: String,
      default: function(this: IDevice) {
        // Iconos por defecto según el tipo
        const icons: Record<string, string> = {
          web: '🌐',
          mobile: '📱',
          desktop: '💻'
        };
        return icons[this.deviceType] || '📟';
      }
    },
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    lastActive: {
      type: Date,
      default: Date.now,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    token: {
      type: String,
      default: null,
      select: false // No incluir en consultas por defecto
    },
    refreshToken: {
      type: String,
      default: null,
      select: false
    },
    location: {
      country: String,
      city: String,
      lat: Number,
      lon: Number
    },
    trustScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  {
    timestamps: true
  }
);

// Índice compuesto para consultas frecuentes
DeviceSchema.index({ userId: 1, isActive: 1 });
DeviceSchema.index({ userId: 1, lastActive: -1 });

// Middleware para actualizar lastActive en cada actualización
DeviceSchema.pre('save', function(next) {
  if (this.isModified('isActive') && this.isActive) {
    this.lastActive = new Date();
  }
  next();
});

// Método para desactivar dispositivo
DeviceSchema.methods.deactivate = function() {
  this.isActive = false;
  this.token = null;
  this.refreshToken = null;
  return this.save();
};

// Método para actualizar última actividad
DeviceSchema.methods.updateActivity = function() {
  this.lastActive = new Date();
  return this.save();
};

export default mongoose.model<IDevice>('Device', DeviceSchema);
