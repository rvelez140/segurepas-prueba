import mongoose, { Schema, Model } from 'mongoose';
import { IParkingAssignment } from '../interfaces/IParking';

const parkingAssignmentSchema: Schema = new mongoose.Schema(
  {
    parkingSpace: {
      type: Schema.Types.ObjectId,
      ref: 'ParkingSpace',
      required: true,
      index: true,
    },
    visit: {
      type: Schema.Types.ObjectId,
      ref: 'Visit',
      index: true,
    },
    vehiclePlate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    entryTime: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    exitTime: {
      type: Date,
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
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
        // Calcular duración si hay salida
        if (ret.exitTime) {
          const entry = new Date(ret.entryTime);
          const exit = new Date(ret.exitTime);
          ret.duration = Math.floor((exit.getTime() - entry.getTime()) / 60000);
        }
      },
    },
  }
);

// Índices compuestos
parkingAssignmentSchema.index({ parkingSpace: 1, exitTime: 1 });
parkingAssignmentSchema.index({ vehiclePlate: 1, entryTime: -1 });

export const ParkingAssignment: Model<IParkingAssignment> = mongoose.model<IParkingAssignment>(
  'ParkingAssignment',
  parkingAssignmentSchema
);

export default ParkingAssignment;
