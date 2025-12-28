import mongoose, { Document, Schema } from 'mongoose';

export interface IMagicLink extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  deviceInfo?: {
    type: 'web' | 'mobile' | 'desktop';
    userAgent?: string;
    ipAddress?: string;
  };
  expiresAt: Date;
  usedAt?: Date;
  isUsed: boolean;
  createdAt: Date;

  // Métodos
  markAsUsed(): Promise<this>;
  isValid(): boolean;
}

const MagicLinkSchema = new Schema<IMagicLink>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    deviceInfo: {
      type: {
        type: String,
        enum: ['web', 'mobile', 'desktop'],
        default: 'web'
      },
      userAgent: String,
      ipAddress: String
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    usedAt: {
      type: Date,
      default: null
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// TTL index para eliminar links expirados automáticamente
MagicLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Índice compuesto para consultas frecuentes
MagicLinkSchema.index({ token: 1, isUsed: 1 });

// Método para marcar como usado
MagicLinkSchema.methods.markAsUsed = function() {
  this.isUsed = true;
  this.usedAt = new Date();
  return this.save();
};

// Método para verificar si está válido
MagicLinkSchema.methods.isValid = function(): boolean {
  return !this.isUsed && this.expiresAt > new Date();
};

export default mongoose.model<IMagicLink>('MagicLink', MagicLinkSchema);
