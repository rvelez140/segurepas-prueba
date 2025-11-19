import mongoose, { Schema, Document } from 'mongoose';

export interface IFeatureToggle extends Document {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  enabledForRoles?: string[];
  enabledForUsers?: string[];
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  metadata?: Record<string, any>;
}

const FeatureToggleSchema: Schema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    description: 'Identificador único de la funcionalidad (ej: "payment_module", "qr_scanner")'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    description: 'Nombre legible de la funcionalidad'
  },
  description: {
    type: String,
    required: true,
    trim: true,
    description: 'Descripción de qué hace esta funcionalidad'
  },
  enabled: {
    type: Boolean,
    default: false,
    description: 'Si está habilitada globalmente'
  },
  enabledForRoles: {
    type: [String],
    default: [],
    description: 'Roles que tienen acceso (admin, guardia, residente)'
  },
  enabledForUsers: {
    type: [String],
    default: [],
    description: 'IDs de usuarios específicos que tienen acceso'
  },
  category: {
    type: String,
    default: 'general',
    description: 'Categoría de la funcionalidad (pagos, reportes, autorizaciones, etc.)'
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
    description: 'Metadatos adicionales para configuración específica'
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
FeatureToggleSchema.index({ key: 1 });
FeatureToggleSchema.index({ enabled: 1 });
FeatureToggleSchema.index({ category: 1 });

export default mongoose.model<IFeatureToggle>('FeatureToggle', FeatureToggleSchema);
