import mongoose, { Document, Schema } from 'mongoose';

export interface IQRLoginSession extends Document {
  sessionId: string;
  qrCode: string; // El código QR en formato base64 o URL
  deviceInfo?: {
    type: 'web' | 'desktop';
    userAgent?: string;
    ipAddress?: string;
    platform?: string;
  };
  status: 'pending' | 'scanned' | 'approved' | 'rejected' | 'expired';
  scannedBy?: mongoose.Types.ObjectId; // Usuario que escaneó el QR
  scannedAt?: Date;
  approvedAt?: Date;
  token?: string; // Token JWT generado tras aprobación
  expiresAt: Date;
  createdAt: Date;
}

const QRLoginSessionSchema = new Schema<IQRLoginSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    qrCode: {
      type: String,
      required: true
    },
    deviceInfo: {
      type: {
        type: String,
        enum: ['web', 'desktop'],
        default: 'web'
      },
      userAgent: String,
      ipAddress: String,
      platform: String
    },
    status: {
      type: String,
      enum: ['pending', 'scanned', 'approved', 'rejected', 'expired'],
      default: 'pending',
      index: true
    },
    scannedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    scannedAt: {
      type: Date,
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    token: {
      type: String,
      default: null,
      select: false
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// TTL index para eliminar sesiones expiradas automáticamente (después de 5 minutos de expiración)
QRLoginSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 300 });

// Índice compuesto para consultas frecuentes
QRLoginSessionSchema.index({ sessionId: 1, status: 1 });

// Método para marcar como escaneado
QRLoginSessionSchema.methods.markAsScanned = function(userId: mongoose.Types.ObjectId) {
  this.status = 'scanned';
  this.scannedBy = userId;
  this.scannedAt = new Date();
  return this.save();
};

// Método para aprobar el login
QRLoginSessionSchema.methods.approve = function(token: string) {
  this.status = 'approved';
  this.approvedAt = new Date();
  this.token = token;
  return this.save();
};

// Método para rechazar el login
QRLoginSessionSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

// Método para verificar si está válido
QRLoginSessionSchema.methods.isValid = function(): boolean {
  return this.status === 'pending' && this.expiresAt > new Date();
};

export default mongoose.model<IQRLoginSession>('QRLoginSession', QRLoginSessionSchema);
